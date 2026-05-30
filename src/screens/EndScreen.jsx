import { useState } from 'react';
import { resetRoom } from '../firebase/db';
import PlayerAvatar from '../components/PlayerAvatar';

const CONFETTI_COLORS = ['#f5c518','#00d4ff','#ff3ca0','#00d97e','#ff9800','#9c5cf5','#ffffff'];

export default function EndScreen({ players, code, myUid, isHost, onRestart }) {
  const [loading, setLoading] = useState(false);
  const [confetti] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 10,
    }))
  );

  const sorted = players.map(([uid, p]) => ({ uid, ...p })).sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const podiumOrder = top3.length >= 2 ? [top3[1], top3[0], top3[2]].filter(Boolean) : top3;
  const podiumMedals = ['🥈', '🥇', '🥉'];
  const rankIcon = (i) => ['🥇','🥈','🥉'][i] || `${i+1}.`;

  const handleRestart = async () => {
    if (loading) return;
    if (!isHost) return;
    setLoading(true);
    try {
      const hostPlayerData = players.find(([uid]) => uid === myUid)?.[1];
      if (!hostPlayerData) throw new Error('Host player not found');
      await resetRoom(code, {
        uid: myUid,
        name: hostPlayerData.name,
        emoji: hostPlayerData.emoji,
        avatarUrl: hostPlayerData.avatarUrl || null
      }, 5);
      // SOLUTION: reload propre vers l'URL de la room — évite tous les bugs de transition
      window.location.href = '/?code=' + code;
    } catch (e) {
      console.error('[EndScreen] Reset error:', e);
      setLoading(false);
      // Fallback: reload simple
      window.location.reload();
    }
  };

  return (
    <div className="screen end-screen" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Confetti */}
      <div className="end-confetti">
        {confetti.map(c => (
          <div key={c.id} className="confetti-piece" style={{
            left: `${c.x}%`, background: c.color,
            width: c.size, height: c.size,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }} />
        ))}
      </div>

      <div className="end-content">
        <div className="end-title">Fin de Partie !</div>
        <div className="end-subtitle">🎯 Et le Maître du Curseur est...</div>

        {/* Podium */}
        {top3.length >= 1 && (
          <div className="podium-container">
            {podiumOrder.map((p, i) => (
              <div key={p.uid} className="podium-place">
                <PlayerAvatar player={p} size={52} style={{ borderRadius: '50%', margin: '0 auto 4px' }} />
                <div className="podium-player-name">{p.name}</div>
                <div className="podium-score">{p.score} pts</div>
                <div className="podium-block">{podiumMedals[i]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Full leaderboard */}
        <div className="end-leaderboard">
          {sorted.map((p, i) => (
            <div key={p.uid} className="leaderboard-row" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`leaderboard-rank ${i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''}`}>
                {rankIcon(i)}
              </div>
              <PlayerAvatar player={p} size={38} style={{ borderRadius: 10 }} />
              <div className="leaderboard-info">
                <div className="leaderboard-name">{p.name}</div>
                <div className="leaderboard-tag">{p.allInUsed ? '🪙 All-In utilisé' : ''}</div>
              </div>
              <div className="leaderboard-score">{p.score} pts</div>
            </div>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>

      <div className="end-footer">
        {isHost ? (
          <button
            className="btn btn-gold btn-lg btn-full"
            onClick={handleRestart}
            disabled={loading}
          >
            {loading ? '⏳ Réinitialisation...' : '🎮 Nouvelle partie'}
          </button>
        ) : (
          <div className="waiting-host-btn">
            <div className="pulse-ring" />
            <span>En attente que l'hôte relance une partie...</span>
          </div>
        )}
      </div>
    </div>
  );
}
