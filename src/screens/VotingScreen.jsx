import { useState } from 'react';
import PlayerAvatar from '../components/PlayerAvatar';
import { submitVote } from '../firebase/db';

export default function VotingScreen({ code, myUid, theme, hint, canAllIn }) {
  const [selected, setSelected] = useState(null);
  const [allIn, setAllIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || loading) return;
    setLoading(true);
    await submitVote(code, myUid, selected, allIn);
  };

  return (
    <div className="screen voting-screen">
      <div className="voting-header">
        <div className="badge badge-cyan">🗳️ Vote secret</div>
        <div style={{ flex: 1 }} />
        <div className="badge badge-surface">{theme.emoji} {theme.name}</div>
      </div>

      <div className="screen-scroll">
        <div className="voting-content">

          {/* Hint */}
          <div className="voting-hint-mini">
            <div className="theme-tag">{theme.emoji} {theme.name}</div>
            "{hint}"
          </div>

          {/* Theme scale — BUG FIX: show 1 and 10 meaning */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{theme.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--cyan)', marginBottom: 3 }}>
                Échelle du thème
              </div>
              <div style={{ fontSize: 12, color: 'var(--off-white)', lineHeight: 1.5 }}>
                {theme.scale}
              </div>
            </div>
          </div>

          <div className="vote-question">Quelle est la note du MJ ?</div>

          {/* Number grid */}
          <div className="number-grid">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                className={`number-btn ${selected === n ? 'selected' : ''}`}
                onClick={() => setSelected(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Scale extremes reminder */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', padding: '0 4px' }}>
            <span>1 = minimum</span>
            <span>10 = maximum</span>
          </div>

          {/* All-In */}
          {canAllIn && (
            <div
              className={`allin-toggle ${allIn ? 'active' : ''}`}
              onClick={() => setAllIn(v => !v)}
            >
              <div className="allin-toggle-icon">🪙</div>
              <div className="allin-toggle-text">
                <div className="allin-toggle-title">All-In !</div>
                <div className="allin-toggle-sub">
                  Pile-Poil → +4pts · Raté → -1pt · Une seule fois par partie
                </div>
              </div>
              <div className="allin-toggle-check">{allIn && '✓'}</div>
            </div>
          )}

          {/* Vote preview */}
          {selected && (
            <div className="card card-glass" style={{ textAlign: 'center', padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6 }}>
                Mon vote
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: allIn ? 'var(--magenta)' : 'var(--gold)', lineHeight: 1 }}>
                {selected}
              </div>
              {allIn && <div style={{ fontSize: 12, color: 'var(--magenta)', marginTop: 6, fontWeight: 700 }}>🪙 All-In activé !</div>}
            </div>
          )}

          <div style={{ height: 16 }} />
        </div>
      </div>

      <div className="voting-footer">
        <button
          className="btn btn-gold btn-lg btn-full"
          disabled={selected === null || loading}
          onClick={handleSubmit}
        >
          {loading ? '⏳ Envoi...' : '✅ Confirmer mon vote'}
        </button>
      </div>
    </div>
  );
}
