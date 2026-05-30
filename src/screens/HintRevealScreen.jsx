import PlayerAvatar from '../components/PlayerAvatar';
export default function HintRevealScreen({ theme, hint, mj, isHost, onStartVoting }) {
  return (
    <div className="screen hint-reveal-screen">
      <div className="screen-header">
        <div style={{ flex: 1 }} />
        <span className="screen-header-title">L'Indice</span>
        <div style={{ flex: 1 }} />
      </div>

      <div className="hint-reveal-content">
        <div style={{ textAlign: 'center' }}>
          <PlayerAvatar player={mj} size={64} style={{ borderRadius: '50%', margin: '0 auto' }} />
          <div className="hint-mj-label">Indice de</div>
          <div className="hint-mj-name">{mj?.name}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <span style={{ fontSize: 24 }}>{theme.emoji}</span>
          <span className="badge badge-surface">{theme.name}</span>
        </div>

        <div className="hint-bubble">
          <p className="hint-text-big">{hint}</p>
        </div>

        <div className="card" style={{ width: '100%', background: 'rgba(245,197,24,0.04)', borderColor: 'rgba(245,197,24,0.15)', padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, textAlign: 'center' }}>
            <strong style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>Thème :</strong> {theme.description}
            <br /><em style={{ fontSize: 11 }}>{theme.scale}</em>
          </div>
        </div>
      </div>

      <div className="hint-reveal-footer">
        {isHost ? (
          <button className="btn btn-gold btn-lg btn-full" onClick={onStartVoting}>
            🗳️ Lancer les votes !
          </button>
        ) : (
          <div className="waiting-host-btn">
            <div className="pulse-ring" />
            <span>En attente de l'hôte pour lancer les votes...</span>
          </div>
        )}
      </div>
    </div>
  );
}
