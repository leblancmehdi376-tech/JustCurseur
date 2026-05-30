import { useState, useEffect, useRef } from 'react';
import PlayerAvatar from '../components/PlayerAvatar';

export default function RevelationScreen({ secretNote, theme, hint, votes, players, mjUid, isHost, onComplete }) {
  const [step, setStep] = useState('cards');   // cards → countdown → reveal → scores → done
  const [visibleCards, setVisibleCards] = useState([]);
  const [countdownNum, setCountdownNum] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(false);
  const timeouts = useRef([]);

  const add = (fn, ms) => { const id = setTimeout(fn, ms); timeouts.current.push(id); };

  const voteEntries = Object.entries(votes || {});
  const getPlayer = (uid) => players.find(([u]) => u === uid)?.[1];

  useEffect(() => {
    // Phase 1 — flip vote cards one by one (face down)
    voteEntries.forEach((_, i) => {
      add(() => setVisibleCards(prev => [...prev, i]), 300 + i * 350);
    });

    const afterCards = 300 + voteEntries.length * 350 + 600;

    // Phase 2 — countdown 3, 2, 1...
    add(() => { setStep('countdown'); setCountdownNum(3); }, afterCards);
    add(() => setCountdownNum(2), afterCards + 900);
    add(() => setCountdownNum(1), afterCards + 1800);
    add(() => {
      setStep('reveal');
      setShowReveal(true);
      setFlash(true);
      add(() => setFlash(false), 600);
      add(() => { setStep('scores'); setShowScores(true); }, 1000);
      add(() => setDone(true), 2200);
    }, afterCards + 2700);

    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const getDiff = (note) => Math.abs(note - secretNote);
  const getLabel = (diff) => diff === 0 ? '🎯 Pile-Poil !' : diff === 1 ? '🔥 Tout Près !' : '💨 Raté';
  const getPoints = (v) => {
    const diff = getDiff(v.note);
    if (v.usedAllIn) return diff === 0 ? 4 : -1;
    return diff === 0 ? 2 : diff === 1 ? 1 : 0;
  };

  return (
    <div className="screen revelation-screen" style={{ justifyContent: 'flex-start' }}>
      {flash && <div className="revelation-flash flash" />}

      {/* Header */}
      <div className="revelation-top">
        <div className="revelation-theme-tag">{theme.emoji} {theme.name}</div>
        <div className="revelation-hint">"{hint}"</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: 20 }}>

        {/* ── STEP: CARDS ── */}
        {(step === 'cards' || step === 'countdown') && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)' }}>
              {step === 'cards' ? 'Les votes sont...' : ''}
            </div>

            {/* Vote cards grid */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'center', maxWidth: 360
            }}>
              {voteEntries.map(([uid, v], i) => {
                const p = getPlayer(uid);
                const isVisible = visibleCards.includes(i);
                const isFlipped = step === 'countdown'; // all face-down during countdown
                return (
                  <div
                    key={uid}
                    className={`vote-card ${isVisible ? 'vote-card-in' : ''}`}
                    style={{ animationDelay: `0ms` }}
                  >
                    <PlayerAvatar player={p} size={36} style={{ borderRadius: '50%' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--off-white)', marginTop: 4, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p?.name}
                    </div>
                    {/* Face-down number */}
                    <div className="vote-card-number" style={{ background: step === 'countdown' ? 'var(--surface3)' : 'rgba(245,197,24,0.1)', borderColor: step === 'countdown' ? 'var(--border)' : 'rgba(245,197,24,0.3)' }}>
                      {step === 'countdown' ? '?' : v.note}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Countdown */}
            {step === 'countdown' && countdownNum && (
              <div key={countdownNum} className="countdown-number">
                {countdownNum}
              </div>
            )}
          </>
        )}

        {/* ── STEP: REVEAL ── */}
        {(step === 'reveal' || step === 'scores' || step === 'done') && (
          <>
            {/* Big revealed number */}
            <div className="reveal-number-container">
              <div className="reveal-label">La note secrète était</div>
              <div className="reveal-big-number">{secretNote}</div>
              <div className="reveal-sublabel">/10 · {theme.emoji} {theme.name}</div>
            </div>

            {/* Flipped cards showing results */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 380 }}>
              {voteEntries.map(([uid, v], i) => {
                const p = getPlayer(uid);
                const diff = getDiff(v.note);
                const pts = getPoints(v);
                const isExact = diff === 0;
                const isClose = diff === 1;
                return (
                  <div
                    key={uid}
                    className="vote-card vote-card-in vote-card-result"
                    style={{
                      borderColor: isExact ? 'var(--gold)' : isClose ? 'var(--cyan)' : 'var(--border)',
                      background: isExact ? 'rgba(245,197,24,0.1)' : isClose ? 'rgba(0,212,255,0.06)' : 'var(--surface)',
                      animationDelay: `${i * 80}ms`
                    }}
                  >
                    <PlayerAvatar player={p} size={36} style={{ borderRadius: '50%' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--off-white)', marginTop: 2, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p?.name}
                    </div>
                    <div className="vote-card-number" style={{
                      background: isExact ? 'rgba(245,197,24,0.2)' : isClose ? 'rgba(0,212,255,0.1)' : 'var(--surface2)',
                      borderColor: isExact ? 'var(--gold)' : isClose ? 'var(--cyan)' : 'var(--border)',
                      color: isExact ? 'var(--gold)' : isClose ? 'var(--cyan)' : 'var(--off-white)',
                    }}>
                      {v.note}
                    </div>
                    <div style={{
                      fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700,
                      color: pts > 0 ? 'var(--green)' : pts < 0 ? 'var(--red)' : 'var(--muted)',
                      marginTop: 2
                    }}>
                      {pts > 0 ? `+${pts}` : pts === 0 ? '±0' : pts}
                    </div>
                  </div>
                );
              })}

              {/* MJ card */}
              <div className="vote-card vote-card-in vote-card-result" style={{ borderColor: 'rgba(245,197,24,0.3)', background: 'rgba(245,197,24,0.05)', animationDelay: `${voteEntries.length * 80}ms` }}>
                <PlayerAvatar player={getPlayer(mjUid)} size={36} style={{ borderRadius: '50%' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--off-white)', marginTop: 2, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getPlayer(mjUid)?.name}
                </div>
                <div className="vote-card-number" style={{ fontSize: 18 }}>👑</div>
                <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-display)', marginTop: 2 }}>MJ</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Continue button */}
      <div style={{ padding: '0 20px 24px' }}>
        {isHost ? (
          <button
            className={`btn btn-gold btn-lg btn-full revelation-continue-btn ${done ? 'show' : ''}`}
            onClick={onComplete}
          >
            📊 Voir les scores
          </button>
        ) : (
          done && (
            <div className="waiting-host-btn">
              <div className="pulse-ring" />
              <span>En attente de l'hôte...</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
