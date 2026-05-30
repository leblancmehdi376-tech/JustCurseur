import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLAYER_EMOJIS } from '../data/themes';

export default function IdentityModal({ takenEmojis = [], onDone, onClose }) {
  const { signInAsGuest, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState('guest'); // 'guest' | 'google'
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(() => {
    const available = PLAYER_EMOJIS.filter(e => !takenEmojis.includes(e));
    return available[0] || PLAYER_EMOJIS[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const player = await signInAsGuest(name.trim(), emoji);
      onDone(player);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const player = await signInWithGoogle(emoji);
      onDone(player);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-content">
          <div className="modal-title">👤 Ton identité</div>

          {/* Avatar picker */}
          <div style={{ marginBottom: 20 }}>
            <div className="setup-section-title">Choisis ton avatar</div>
            <div className="emoji-grid">
              {PLAYER_EMOJIS.map(e => {
                const taken = takenEmojis.includes(e);
                return (
                  <div
                    key={e}
                    className={`emoji-option ${taken ? 'taken' : ''} ${emoji === e ? 'selected-emoji' : ''}`}
                    style={emoji === e ? { background: 'rgba(245,197,24,0.2)', borderColor: 'var(--gold)', border: '2px solid' } : {}}
                    onClick={() => !taken && setEmoji(e)}
                  >
                    {e}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className={`btn ${tab === 'guest' ? 'btn-gold' : 'btn-surface'}`}
              style={{ flex: 1, padding: '10px' }}
              onClick={() => setTab('guest')}
            >
              🎭 Pseudo invité
            </button>
            <button
              className={`btn ${tab === 'google' ? 'btn-gold' : 'btn-surface'}`}
              style={{ flex: 1, padding: '10px' }}
              onClick={() => setTab('google')}
            >
              🔑 Google
            </button>
          </div>

          {tab === 'guest' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="input"
                placeholder="Ton pseudo (ex: Mario)"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={16}
                onKeyDown={e => e.key === 'Enter' && handleGuest()}
                autoFocus
              />
              <button
                className="btn btn-gold btn-full"
                style={{ padding: '14px' }}
                disabled={!name.trim() || loading}
                onClick={handleGuest}
              >
                {loading ? '...' : `Jouer en tant que ${name || 'invité'} ${emoji}`}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card" style={{ padding: '14px 16px', fontSize: 13, color: 'var(--off-white)', lineHeight: 1.6 }}>
                Ton nom Google sera utilisé comme pseudo. Ton score sera sauvegardé entre les parties.
              </div>
              <button
                className="btn btn-gold btn-full"
                style={{ padding: '14px' }}
                disabled={loading}
                onClick={handleGoogle}
              >
                {loading ? '...' : `🔑 Continuer avec Google`}
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,71,87,0.1)', borderRadius: 8, border: '1px solid rgba(255,71,87,0.3)', fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          {onClose && (
            <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={onClose}>
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
