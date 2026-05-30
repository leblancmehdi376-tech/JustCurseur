import { useEffect, useState, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameRouter from './screens/GameRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { listenRoom, joinRoom, createRoom } from './firebase/db';

// Get code from URL once at startup
function getUrlCode() {
  const p = new URLSearchParams(window.location.search);
  const c = p.get('code') || p.get('join');
  return c && c.length >= 4 ? c.toUpperCase() : null;
}

function AppInner() {
  const { user, identity, discordReady, discordRoomCode, getPlayer, isDiscordMode } = useAuth();
  const [view, setView] = useState('home');
  const [roomCode, setRoomCode] = useState(null);
  const [myUid, setMyUid] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const viewRef = useRef('home');
  const urlCode = useRef(getUrlCode());

  useEffect(() => { viewRef.current = view; }, [view]);

  // ── AUTO-JOIN VIA URL CODE (web mode) ────────────────────────
  useEffect(() => {
    if (isDiscordMode) return;
    if (!urlCode.current) return;
    if (!user || !identity) return;
    if (joining || roomCode) return;

    const player = getPlayer();
    if (!player) return;

    setJoining(true);
    const code = urlCode.current;

    joinRoom(code, player)
      .then(() => {
        setRoomCode(code);
        setMyUid(player.uid);
        setView('lobby');
        window.history.replaceState({}, '', `/?code=${code}`);
      })
      .catch((err) => {
        if (err.message.includes('commencé')) {
          setRoomCode(code);
          setMyUid(player.uid);
          setView('game');
        } else {
          // Can't auto-join, show home with prefilled code
          setJoining(false);
        }
      });
  }, [user, identity]);

  // ── DISCORD AUTO-JOIN ────────────────────────────────────────
  useEffect(() => {
    if (!isDiscordMode) return;
    if (!discordReady || !user || !identity) return;
    if (joining || roomCode) return;

    const player = getPlayer();
    if (!player) return;

    setJoining(true);
    const code = discordRoomCode || 'DISCORD';

    const doJoin = async () => {
      try {
        await joinRoom(code, player);
        setRoomCode(code);
        setMyUid(player.uid);
        setView('lobby');
      } catch (err) {
        if (err.message.includes('introuvable')) {
          await createRoom(player, 5, code);
          setRoomCode(code);
          setMyUid(player.uid);
          setView('lobby');
        } else if (err.message.includes('commencé')) {
          setRoomCode(code);
          setMyUid(player.uid);
          setView('game');
        } else if (err.message.includes('pris')) {
          const newEmoji = ['🎯','🚀','⚡','🌟','💎','🎪','🦩','🐲'][Math.floor(Math.random()*8)];
          await joinRoom(code, { ...player, emoji: newEmoji });
          setRoomCode(code);
          setMyUid(player.uid);
          setView('lobby');
        } else {
          setJoinError(err.message);
          setJoining(false);
        }
      }
    };

    doJoin();
  }, [isDiscordMode, discordReady, user, identity]);

  // ── WATCH PHASE lobby→game ───────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const unsub = listenRoom(roomCode, (room) => {
      if (!room) return;
      const phase = room.state?.phase;
      const cur = viewRef.current;
      if (phase && phase !== 'lobby' && phase !== 'end' && cur === 'lobby') {
        setView('game');
      }
      // game→lobby: reload propre (évite écran noir)
      if (phase === 'lobby' && cur === 'game') {
        window.location.href = '/?code=' + roomCode;
      }
    });
    return unsub;
  }, [roomCode]);

  const handleRoomCreated = (code, player) => {
    setRoomCode(code); setMyUid(player.uid); setView('lobby');
    window.history.replaceState({}, '', `/?code=${code}`);
  };

  const handleRoomJoined = (code, player) => {
    setRoomCode(code); setMyUid(player.uid); setView('lobby');
    window.history.replaceState({}, '', `/?code=${code}`);
  };

  // Loading
  if (user === undefined || (isDiscordMode && !discordReady)) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontSize: 56, animation: 'logoBounce 2s ease-in-out infinite' }}>🎯</div>
        <div className="loader" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {isDiscordMode ? 'Connexion Discord...' : 'Chargement...'}
        </div>
      </div>
    );
  }

  // Joining spinner
  if (joining && !roomCode) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontSize: 56 }}>🎮</div>
        <div className="loader" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Rejoindre la partie...
        </div>
        {joinError && <div className="error-msg" style={{ maxWidth: 280, textAlign: 'center' }}>{joinError}</div>}
      </div>
    );
  }

  return (
    <>
      {view === 'home' && (
        <HomeScreen
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
          prefillCode={urlCode.current}
        />
      )}
      {view === 'lobby' && roomCode && <LobbyScreen code={roomCode} myUid={myUid} />}
      {view === 'game' && roomCode && myUid && <GameRouter code={roomCode} myUid={myUid} />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app">
          <div className="bg-orbs">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="bg-orb bg-orb-3" />
          </div>
          <ErrorBoundary>
            <AppInner />
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
