// Reusable avatar — shows Discord profile pic if available, emoji otherwise
export default function PlayerAvatar({ player, size = 44, style = {} }) {
  const s = {
    width: size,
    height: size,
    borderRadius: size > 40 ? 14 : '50%',
    background: 'var(--surface2)',
    border: '2px solid var(--border-bright)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.55,
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (player?.avatarUrl) {
    return (
      <div style={s}>
        <img
          src={player.avatarUrl}
          alt={player.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        {/* Fallback emoji if image fails */}
        <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {player.emoji}
        </span>
      </div>
    );
  }

  return <div style={s}>{player?.emoji || '?'}</div>;
}
