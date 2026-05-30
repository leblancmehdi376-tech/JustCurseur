import PlayerAvatar from '../components/PlayerAvatar';
import { THEMES } from '../data/themes';

export default function ScoresScreen({ players, state, votes, isHost, onNext }) {
  // BUG FIX: use prevSecretNote/prevThemeId/prevHint/prevMJIndex for display
  const {
    prevSecretNote, prevThemeId, prevHint, prevMJIndex,
    prevRound, currentRound, totalRounds
  } = state;

  const displayRound = prevRound || (currentRound - 1);
  const displayNote = prevSecretNote;
  const displayTheme = THEMES.find(t => t.id === prevThemeId) || THEMES[0];
  const displayMJIndex = prevMJIndex ?? 0;

  const sorted = [...players].map(([uid, p]) => ({ uid, ...p })).sort((a, b) => b.score - a.score);
  const mjUid = players[displayMJIndex]?.[0];

  const rankIcon = (i) => ['🥇','🥈','🥉'][i] || `${i+1}.`;

  const getGain = (uid) => {
    if (uid === mjUid) return '👑';
    const v = votes?.[uid];
    if (!v) return 0;
    const diff = Math.abs(v.note - (displayNote || 0));
    if (v.usedAllIn) return diff === 0 ? 4 : -1;
    return diff === 0 ? 2 : diff === 1 ? 1 : 0;
  };

  const isLastRound = displayRound >= totalRounds;

  return (
    <div className="screen scores-screen">
      <div className="screen-header">
        <div className="badge badge-gold">Manche {displayRound}/{totalRounds}</div>
        <span className="screen-header-title">Scores</span>
        <div style={{ width: 80 }} />
      </div>

      <div className="screen-scroll">
        <div className="scores-content">

          {/* Recap */}
          <div className="round-recap">
            <div className="round-recap-header">
              <span style={{ fontSize: 16 }}>📜</span>
              <span className="title">Recap de la manche</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)' }}>Thème</span>
                <span style={{ fontWeight: 700 }}>{displayTheme?.emoji} {displayTheme?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)' }}>Indice</span>
                <span style={{ fontStyle: 'italic', color: 'var(--off-white)', maxWidth: '60%', textAlign: 'right' }}>"{prevHint}"</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)' }}>Note secrète</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', fontSize: 22 }}>
                  {displayNote}/10
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)' }}>MJ</span>
                <span style={{ fontWeight: 700 }}>
                  {players[displayMJIndex]?.[1]?.emoji} {players[displayMJIndex]?.[1]?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Votes recap */}
          {votes && Object.keys(votes).length > 0 && (
            <div>
              <div className="setup-section-title">Votes de la manche</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(votes).map(([uid, v]) => {
                  const p = players.find(([u]) => u === uid)?.[1];
                  const diff = Math.abs(v.note - displayNote);
                  const label = diff === 0 ? '🎯 Pile-Poil !' : diff === 1 ? '🔥 Tout Près !' : '💨 Raté';
                  const pts = v.usedAllIn ? (diff === 0 ? 4 : -1) : diff === 0 ? 2 : diff === 1 ? 1 : 0;
                  return (
                    <div key={uid} className="score-result-row">
                      <span className="emoji">{p?.emoji}</span>
                      <div className="score-result-info">
                        <div className="score-result-name">{p?.name}</div>
                        <div className="score-result-detail">A voté <strong>{v.note}</strong> · {label} {v.usedAllIn ? '🪙' : ''}</div>
                      </div>
                      <div className={`score-result-badge ${pts > 0 ? 'positive' : pts < 0 ? 'negative' : 'zero'}`}>
                        {pts > 0 ? `+${pts}` : pts}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <div className="setup-section-title">Classement général</div>
            <div className="leaderboard">
              {sorted.map((p, i) => {
                const gain = getGain(p.uid);
                return (
                  <div key={p.uid} className="leaderboard-row" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className={`leaderboard-rank ${i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''}`}>
                      {rankIcon(i)}
                    </div>
                    <PlayerAvatar player={p} size={38} style={{ borderRadius: 10 }} />
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{p.name}</div>
                      <div className="leaderboard-tag">
                        {p.uid === mjUid ? '👑 MJ ce tour · ' : ''}
                        {p.exactStreak > 1 ? `🔥 ${p.exactStreak} Pile-Poil de suite !` : ''}
                        {p.allInUsed ? ' 🪙 All-In utilisé' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="leaderboard-score">{p.score}</div>
                      <div className={`leaderboard-gain ${typeof gain === 'number' && gain > 0 ? '' : typeof gain === 'number' && gain < 0 ? 'neg' : 'zero'}`}>
                        {typeof gain === 'number' ? (gain > 0 ? `+${gain}` : gain === 0 ? '±0' : gain) : gain}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ height: 16 }} />
        </div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        {isHost ? (
          <button className="btn btn-gold btn-lg btn-full" onClick={onNext}>
            {isLastRound ? '🏆 Voir le podium final !' : `➡️ Manche ${displayRound + 1}`}
          </button>
        ) : (
          <div className="waiting-host-btn">
            <div className="pulse-ring" />
            <span>En attente de l'hôte...</span>
          </div>
        )}
      </div>
    </div>
  );
}
