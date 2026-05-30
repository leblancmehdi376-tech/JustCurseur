import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createRoom, joinRoom } from '../firebase/db';
import IdentityModal from '../components/IdentityModal';
import RulesModal from './RulesModal';

export default function HomeScreen({ onRoomCreated, onRoomJoined, prefillCode }) {
  const { user, identity, getPlayer } = useAuth();
  // If a code is prefilled from URL, go straight to join mode
  const [mode, setMode] = useState(prefillCode ? 'join' : null);
  const [rounds, setRounds] = useState(5);
  const [joinCode, setJoinCode] = useState(prefillCode || '');
  const [showIdentity, setShowIdentity] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const needsIdentity = !user || !identity;

  const handleCreate = async (player) => {
    setLoading(true);
    setError('');
    try {
      const code = await createRoom(player, rounds);
      onRoomCreated(code, player);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleJoin = async (player) => {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) { setError('Code invalide'); return; }
    setLoading(true);
    setError('');
    try {
      await joinRoom(code, player);
      onRoomJoined(code, player);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const triggerAction = (action) => {
    if (needsIdentity) {
      setPendingAction(action);
      setShowIdentity(true);
    } else {
      if (action === 'create') handleCreate(getPlayer());
      if (action === 'join') handleJoin(getPlayer());
    }
  };

  const onIdentityDone = (player) => {
    setShowIdentity(false);
    if (pendingAction === 'create') handleCreate(player);
    if (pendingAction === 'join') handleJoin(player);
    setPendingAction(null);
  };

  return (
    <div className="screen home-screen">
      <div className="home-hero">
        <div className="home-logo-container">
          <span className="home-logo-icon">🎯</span>
        </div>
        <div className="home-title">
          <span className="home-title-small">le</span>
          <span className="home-title-big">Juste<br />Curseur</span>
        </div>
        <p className="home-subtitle">Le jeu multijoueur qui teste ton sens du jugement</p>

        <div className="home-gauge-preview">
          <div className="gauge-preview-bar"><div className="gauge-preview-fill" /></div>
          <div className="gauge-preview-numbers">
            {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>

        {identity && (
          <div className="identity-chip" onClick={() => setShowIdentity(true)}>
            <span>{identity.emoji}</span>
            <span>{identity.name}</span>
            <span className="identity-chip-edit">✏️</span>
          </div>
        )}
      </div>

      <div className="home-actions">
        {mode === null && (
          <>
            <button className="btn btn-gold btn-lg btn-full" onClick={() => setMode('create')}>
              ✨ Créer une partie
            </button>
            <button className="btn btn-outline btn-full" onClick={() => setMode('join')}>
              🔗 Rejoindre avec un code
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setShowRules(true)}>
              📖 Règles du jeu
            </button>
          </>
        )}

        {mode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="setup-section-title">Nombre de manches</div>
              <div className="rounds-options">
                {[3,5,8].map(r => (
                  <div key={r} className={`round-option ${rounds === r ? 'selected' : ''}`} onClick={() => setRounds(r)}>
                    {r}<span>{r === 3 ? 'Court' : r === 5 ? 'Normal' : 'Long'}</span>
                  </div>
                ))}
              </div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-gold btn-lg btn-full" disabled={loading} onClick={() => triggerAction('create')}>
              {loading ? '⏳ Création...' : '🚀 Créer le salon'}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => { setMode(null); setError(''); }}>← Retour</button>
          </div>
        )}

        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="setup-section-title">Code du salon</div>
              <input
                className="input"
                placeholder="Ex : XKCD42"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{ textAlign: 'center', fontSize: 28, fontFamily: 'var(--font-display)', letterSpacing: '0.3em', textTransform: 'uppercase' }}
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button
              className="btn btn-gold btn-lg btn-full"
              disabled={loading || joinCode.length < 4}
              onClick={() => triggerAction('join')}
            >
              {loading ? '⏳ Connexion...' : '🔗 Rejoindre'}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => { setMode(null); setError(''); setJoinCode(''); }}>← Retour</button>
          </div>
        )}
      </div>

      <div className="home-footer">2–8 joueurs · En ligne · 🎯</div>

      {showIdentity && (
        <IdentityModal onDone={onIdentityDone} onClose={() => setShowIdentity(false)} />
      )}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
