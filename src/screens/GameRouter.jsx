import { useEffect, useState, useRef } from 'react';
import { listenRoom, computeAndSaveScores, nextRound, advanceToMJWrite, startVoting, submitHint } from '../firebase/db';
import { THEMES } from '../data/themes';
import PlayerAvatar from '../components/PlayerAvatar';
import MJScreen from './MJScreen';
import HintRevealScreen from './HintRevealScreen';
import VotingScreen from './VotingScreen';
import RevelationScreen from './RevelationScreen';
import ScoresScreen from './ScoresScreen';
import EndScreen from './EndScreen';

function WaitingForMJ({ mj, theme, round, totalRounds }) {
  return (
    <div className="screen pass-screen">
      <PlayerAvatar player={mj} size={96} style={{ borderRadius: '50%', marginBottom: 20, boxShadow: '0 0 40px rgba(245,197,24,0.2)' }} />
      <div className="pass-label">Le Maître du Jeu</div>
      <div className="pass-name">{mj?.name}</div>
      <p className="pass-subtitle" style={{ marginBottom: 32 }}>
        {mj?.name} prépare son indice mystère...<br />
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{theme?.emoji} {theme?.name}</span>
      </p>
      <div className="badge badge-gold">Manche {round}/{totalRounds}</div>
      <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} className="thinking-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function WaitingForVotes({ voters, votes, myVote }) {
  const submitted = Object.keys(votes || {}).length;
  const total = voters.length;
  return (
    <div className="screen pass-screen" style={{ gap: 16 }}>
      <div style={{ fontSize: 60 }}>🗳️</div>
      <div className="pass-name" style={{ fontSize: 28 }}>Votes en cours</div>
      <div className="vote-progress-bar-wrap">
        <div className="vote-progress-bar-fill" style={{ width: `${total > 0 ? (submitted / total) * 100 : 0}%` }} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)' }}>
        {submitted} / {total} votes
      </div>
      {/* Show voter avatars with check/pending */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {voters.map(([uid, p]) => (
          <div key={uid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ position: 'relative' }}>
              <PlayerAvatar player={p} size={44} style={{ borderRadius: '50%', opacity: votes?.[uid] ? 1 : 0.4 }} />
              {votes?.[uid] && (
                <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--green)', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
              )}
            </div>
            <div style={{ fontSize: 10, color: votes?.[uid] ? 'var(--green)' : 'var(--muted)', fontFamily: 'var(--font-display)', maxWidth: 50, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </div>
          </div>
        ))}
      </div>
      {myVote && (
        <div className="badge badge-green" style={{ fontSize: 14, padding: '6px 14px' }}>
          ✅ Ton vote : <strong>{myVote.note}/10</strong>
        </div>
      )}
      <p className="pass-subtitle">En attente des autres joueurs...</p>
    </div>
  );
}

export default function GameRouter({ code, myUid }) {
  const [room, setRoom] = useState(null);
  const scoringRef = useRef(false);

  useEffect(() => {
    const unsub = listenRoom(code, setRoom);
    return unsub;
  }, [code]);

  // Reset scoring lock when phase changes away from revelation
  useEffect(() => {
    if (room?.state?.phase !== 'revelation') scoringRef.current = false;
  }, [room?.state?.phase]);

  if (!room) return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div className="loader" />
    </div>
  );

  const { state, config, players: playersMap = {}, votes = {} } = room;
  const { phase, currentRound, currentMJIndex, secretNote, themeId, currentHint } = state;

  const players = Object.entries(playersMap).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const mjEntry = players[currentMJIndex];
  const mjUid = mjEntry?.[0];
  const mjPlayer = mjEntry?.[1];
  const isMJ = myUid === mjUid;
  const isHost = config.hostId === myUid;
  const voterPlayers = players.filter(([uid]) => uid !== mjUid);
  const myVote = votes[myUid];

  if (phase === 'mj-write') {
    if (isMJ) {
      return (
        <MJScreen
          player={{ ...mjPlayer, uid: mjUid }}
          theme={theme}
          secretNote={secretNote}
          currentRound={currentRound}
          totalRounds={config.totalRounds}
          onSubmit={(hint) => submitHint(code, hint)}
        />
      );
    }
    return <WaitingForMJ mj={mjPlayer} theme={theme} round={currentRound} totalRounds={config.totalRounds} />;
  }

  if (phase === 'hint-reveal') {
    return (
      <HintRevealScreen
        theme={theme}
        hint={currentHint}
        mj={{ ...mjPlayer, uid: mjUid }}
        isHost={isHost}
        onStartVoting={() => startVoting(code)}
      />
    );
  }

  if (phase === 'voting') {
    if (isMJ) return <WaitingForVotes voters={voterPlayers} votes={votes} myVote={null} />;
    if (myVote) return <WaitingForVotes voters={voterPlayers} votes={votes} myVote={myVote} />;
    return (
      <VotingScreen
        code={code}
        myUid={myUid}
        theme={theme}
        hint={currentHint}
        canAllIn={!playersMap[myUid]?.allInUsed}
      />
    );
  }

  if (phase === 'revelation') {
    return (
      <RevelationScreen
        secretNote={secretNote}
        theme={theme}
        hint={currentHint}
        votes={votes}
        players={players}
        mjUid={mjUid}
        isHost={isHost}
        onComplete={async () => {
          if (scoringRef.current) return;
          scoringRef.current = true;
          await computeAndSaveScores(code);
          await nextRound(code);
        }}
      />
    );
  }

  if (phase === 'round-scores') {
    return (
      <ScoresScreen
        players={players}
        state={state}       // Pass full state — ScoresScreen reads prevSecretNote etc.
        votes={votes}
        isHost={isHost}
        onNext={() => advanceToMJWrite(code)}
      />
    );
  }

  if (phase === 'end') {
    return (
      <EndScreen
        players={players}
        code={code}
        myUid={myUid}
        isHost={isHost}
        onRestart={() => {}}
      />
    );
  }

  return null;
}
