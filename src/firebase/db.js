import { db } from './config';
import { ref, set, get, update, onValue, off, remove } from 'firebase/database';
import { THEMES } from '../data/themes';
import { isDiscord } from '../discord/sdk';
import {
  discordDbGet, discordDbSet, discordDbUpdate,
  discordDbDelete, discordDbListen
} from './db-discord';

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomNote() { return Math.floor(Math.random() * 10) + 1; }

// Pick a theme that hasn't been used yet in this room
// Falls back to full pool if all themes exhausted (shouldn't happen with 15 themes)
function pickTheme(usedThemeIds = []) {
  const available = THEMES.filter(t => !usedThemeIds.includes(t.id));
  const pool = available.length > 0 ? available : THEMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Abstracted DB ops ──────────────────────────────────────────
async function dbGet(path) {
  if (isDiscord()) return discordDbGet(path);
  const snap = await get(ref(db, path));
  return snap.val();
}

async function dbSet(path, data) {
  if (isDiscord()) return discordDbSet(path, data);
  return set(ref(db, path), data);
}

async function dbUpdate(path, data) {
  if (isDiscord()) return discordDbUpdate(path, data);
  return update(ref(db, path), data);
}

async function dbDelete(path) {
  if (isDiscord()) return discordDbDelete(path);
  return remove(ref(db, path));
}

async function dbMultiUpdate(updates) {
  if (isDiscord()) {
    for (const [path, value] of Object.entries(updates)) {
      await discordDbSet(path, value);
    }
    return;
  }
  return update(ref(db), updates);
}

// ── ROOM CREATION ──────────────────────────────────────────────
export async function createRoom(hostPlayer, totalRounds, forceCode = null) {
  let code;
  if (forceCode) {
    code = forceCode;
  } else {
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await dbGet(`rooms/${code}`);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
  }

  const firstTheme = pickTheme([]);

  await dbSet(`rooms/${code}`, {
    config: { hostId: hostPlayer.uid, totalRounds, createdAt: Date.now() },
    state: {
      phase: 'lobby',
      currentRound: 1,
      currentMJIndex: 0,
      secretNote: randomNote(),
      themeId: firstTheme.id,
      currentHint: '',
      usedThemeIds: [firstTheme.id],  // track used themes
      prevSecretNote: null,
      prevThemeId: null,
      prevHint: null,
      prevMJIndex: null,
    },
    players: {
      [hostPlayer.uid]: {
        name: hostPlayer.name,
        emoji: hostPlayer.emoji,
        avatarUrl: hostPlayer.avatarUrl || null,
        score: 0,
        allInUsed: false,
        exactStreak: 0,
        isHost: true,
        joinedAt: Date.now(),
      },
    },
  });

  return code;
}

// ── JOIN ROOM ───────────────────────────────────────────────────
export async function joinRoom(code, player) {
  const room = await dbGet(`rooms/${code}`);
  if (!room) throw new Error('Salon introuvable. Vérifie le code !');
  if (room.state.phase !== 'lobby') throw new Error('La partie a déjà commencé !');

  const players = room.players || {};
  if (Object.keys(players).length >= 8) throw new Error('Le salon est complet (8 joueurs max)');
  if (players[player.uid]) return room;

  const takenEmojis = Object.values(players).map(p => p.emoji);
  if (takenEmojis.includes(player.emoji)) throw new Error('Cet avatar est déjà pris !');

  await dbSet(`rooms/${code}/players/${player.uid}`, {
    name: player.name,
    emoji: player.emoji,
    avatarUrl: player.avatarUrl || null,
    score: 0,
    allInUsed: false,
    exactStreak: 0,
    isHost: false,
    joinedAt: Date.now(),
  });

  return room;
}

// ── START GAME ──────────────────────────────────────────────────
export async function startGame(code) {
  const room = await dbGet(`rooms/${code}`);
  const usedThemeIds = room?.state?.usedThemeIds || [];
  const theme = pickTheme(usedThemeIds);
  const newUsed = [...new Set([...usedThemeIds, theme.id])];

  await dbUpdate(`rooms/${code}/state`, {
    phase: 'mj-write',
    currentRound: 1,
    currentMJIndex: 0,
    secretNote: randomNote(),
    themeId: theme.id,
    currentHint: '',
    usedThemeIds: newUsed,
    prevSecretNote: null,
    prevThemeId: null,
    prevHint: null,
    prevMJIndex: null,
  });
}

// ── SUBMIT HINT ─────────────────────────────────────────────────
export async function submitHint(code, hint) {
  await dbUpdate(`rooms/${code}/state`, { currentHint: hint, phase: 'hint-reveal' });
}

// ── START VOTING ─────────────────────────────────────────────────
export async function startVoting(code) {
  await dbDelete(`rooms/${code}/votes`);
  await dbUpdate(`rooms/${code}/state`, { phase: 'voting', votingStartedAt: Date.now() });
}

// ── SUBMIT VOTE ──────────────────────────────────────────────────
export async function submitVote(code, uid, note, usedAllIn) {
  await dbSet(`rooms/${code}/votes/${uid}`, { note, usedAllIn, submittedAt: Date.now() });

  const room = await dbGet(`rooms/${code}`);
  const players = Object.entries(room.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const mjUid = players[room.state.currentMJIndex]?.[0];
  const voterUids = players.filter(([u]) => u !== mjUid).map(([u]) => u);
  const votes = room.votes || {};
  const allVoted = voterUids.every(u => votes[u]);
  if (allVoted) await dbUpdate(`rooms/${code}/state`, { phase: 'revelation' });
}

// ── COMPUTE & SAVE SCORES ─────────────────────────────────────────
export async function computeAndSaveScores(code) {
  const room = await dbGet(`rooms/${code}`);
  const { secretNote, currentMJIndex } = room.state;
  const players = Object.entries(room.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const mjUid = players[currentMJIndex]?.[0];
  const votes = room.votes || {};

  let exactCount = 0;
  const updates = {};

  players.forEach(([uid, p]) => {
    if (uid === mjUid) return;
    const v = votes[uid];
    if (!v) return;
    const diff = Math.abs(v.note - secretNote);
    let pts = 0;
    if (v.usedAllIn) {
      pts = diff === 0 ? 4 : -1;
    } else if (diff === 0) {
      pts = (p.exactStreak || 0) > 0 ? 4 : 2;
      exactCount++;
    } else if (diff === 1) {
      pts = 1;
    }
    updates[`rooms/${code}/players/${uid}/score`] = Math.max(0, (p.score || 0) + pts);
    updates[`rooms/${code}/players/${uid}/exactStreak`] = diff === 0 ? (p.exactStreak || 0) + 1 : 0;
    if (v.usedAllIn) updates[`rooms/${code}/players/${uid}/allInUsed`] = true;
  });

  const mjPlayer = players[currentMJIndex]?.[1];
  const voterCount = players.filter(([uid]) => uid !== mjUid).length;
  const allExact = exactCount === voterCount && voterCount > 0;
  const mjPts = allExact ? 0 : exactCount;
  updates[`rooms/${code}/players/${mjUid}/score`] = Math.max(0, (mjPlayer?.score || 0) + mjPts);

  await dbMultiUpdate(updates);
  return { mjPts, allExact, exactCount };
}

// ── NEXT ROUND ────────────────────────────────────────────────────
export async function nextRound(code) {
  const room = await dbGet(`rooms/${code}`);
  const { currentRound, currentMJIndex, secretNote, themeId, currentHint, usedThemeIds = [] } = room.state;
  const { totalRounds } = room.config;
  const playerCount = Object.keys(room.players || {}).length;

  if (currentRound >= totalRounds) {
    await dbUpdate(`rooms/${code}/state`, {
      phase: 'end',
      prevSecretNote: secretNote,
      prevThemeId: themeId,
      prevHint: currentHint,
      prevMJIndex: currentMJIndex,
    });
    return;
  }

  const nextMJIndex = (currentMJIndex + 1) % playerCount;
  // Pick a theme not yet used in this party
  const nextTheme = pickTheme(usedThemeIds);
  const newUsed = [...new Set([...usedThemeIds, nextTheme.id])];

  await dbUpdate(`rooms/${code}/state`, {
    phase: 'round-scores',
    // Save current round for scores screen
    prevSecretNote: secretNote,
    prevThemeId: themeId,
    prevHint: currentHint,
    prevMJIndex: currentMJIndex,
    prevRound: currentRound,
    // Next round data
    currentRound: currentRound + 1,
    currentMJIndex: nextMJIndex,
    secretNote: randomNote(),
    themeId: nextTheme.id,
    currentHint: '',
    usedThemeIds: newUsed,
    votingStartedAt: null,
  });
}

// ── ADVANCE → MJ-WRITE ────────────────────────────────────────────
export async function advanceToMJWrite(code) {
  await dbUpdate(`rooms/${code}/state`, { phase: 'mj-write' });
}

// ── KICK PLAYER ───────────────────────────────────────────────────
export async function kickPlayer(code, uid) {
  await dbDelete(`rooms/${code}/players/${uid}`);
}


// ── RESET ROOM (nouvelle partie) ─────────────────────────────────
export async function resetRoom(code, hostPlayer, totalRounds) {
  const firstTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  // Reset to lobby state, keep same players but zero scores
  const room = await dbGet(`rooms/${code}`);
  const players = room?.players || {};

  const resetPlayers = {};
  Object.entries(players).forEach(([uid, p]) => {
    resetPlayers[uid] = {
      ...p,
      score: 0,
      allInUsed: false,
      exactStreak: 0,
      isHost: uid === hostPlayer.uid,
    };
  });

  await dbSet(`rooms/${code}`, {
    config: { hostId: hostPlayer.uid, totalRounds, createdAt: Date.now() },
    state: {
      phase: 'lobby',
      currentRound: 1,
      currentMJIndex: 0,
      secretNote: Math.floor(Math.random() * 10) + 1,
      themeId: firstTheme.id,
      currentHint: '',
      usedThemeIds: [firstTheme.id],
      prevSecretNote: null,
      prevThemeId: null,
      prevHint: null,
      prevMJIndex: null,
    },
    players: resetPlayers,
  });
}

// ── LISTENER ──────────────────────────────────────────────────────
export function listenRoom(code, callback) {
  if (isDiscord()) return discordDbListen(`rooms/${code}`, callback);
  const r = ref(db, `rooms/${code}`);
  onValue(r, snap => callback(snap.val()));
  return () => off(r);
}
