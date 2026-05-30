import { useEffect, useState } from 'react';
import { listenRoom, startGame, kickPlayer } from '../firebase/db';
import PlayerAvatar from '../components/PlayerAvatar';

export default function LobbyScreen({ code, myUid }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const unsub = listenRoom(code, setRoom);
    return unsub;
  }, [code]);

  if (!room) return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader" />
    </div>
  );

  const players = Object.entries(room.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const isHost = room.config.hostId === myUid;
  const canStart = players.length >= 2;
  const shareUrl = `${window.location.origin}?code=${code}`;

  return (
    <div className="screen lobby-screen">
      <div className="lobby-header">
        <div className="badge badge-gold">Salon</div>
        <div className="lobby-code-display" onClick={() => navigator.clipboard.writeText(code).catch(()=>{})}>
          <span className="lobby-code-label">CODE</span>
          <span className="lobby-code-value">{code}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>📋</span>
        </div>
        <div className="badge badge-surface">{room.config.totalRounds} manches</div>
      </div>

      <div className="screen-scroll">
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Share */}
          <div className="card card-gold" style={{ padding: '16px' }}>
            <div className="setup-section-title" style={{ marginBottom: 10 }}>📨 Inviter des amis</div>
            <div style={{ fontSize: 11, color: 'var(--off-white)', marginBottom: 12, wordBreak: 'break-all', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
              {shareUrl}
            </div>
            <button className="btn btn-gold btn-full" onClick={() => navigator.clipboard.writeText(shareUrl).catch(()=>{})} style={{ padding: '10px' }}>
              📋 Copier le lien d'invitation
            </button>
          </div>

          {/* Players */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="setup-section-title" style={{ margin: 0 }}>
                Joueurs ({players.length}/8)
              </div>
              <div className="badge badge-cyan" style={{ fontSize: 11 }}>
                <span className="live-dot" /> En direct
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {players.map(([uid, p], i) => (
                <div key={uid} className="lobby-player-row" style={{ animationDelay: `${i * 60}ms` }}>
                  <PlayerAvatar player={p} size={48} style={{ borderRadius: 12 }} />
                  <div className="lobby-player-info">
                    <div className="lobby-player-name">{p.name}</div>
                    {uid === room.config.hostId && (
                      <div className="badge badge-gold" style={{ fontSize: 10, padding: '2px 6px' }}>👑 Hôte</div>
                    )}
                  </div>
                  {uid === myUid && (
                    <div className="badge badge-cyan" style={{ fontSize: 11 }}>C'est toi</div>
                  )}
                  {isHost && uid !== myUid && (
                    <button
                      className="btn btn-ghost"
                      style={{ color: 'var(--red)', padding: '4px 8px', fontSize: 18 }}
                      onClick={() => kickPlayer(code, uid)}
                    >✕</button>
                  )}
                </div>
              ))}

              {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="lobby-player-row empty">
                  <div className="lobby-player-avatar empty">?</div>
                  <div className="lobby-player-info">
                    <div style={{ color: 'var(--muted)', fontSize: 14, fontStyle: 'italic' }}>En attente...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!canStart && (
            <div className="card" style={{ background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.2)', padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--cyan)' }}>
              Il faut au moins 2 joueurs pour commencer
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        {isHost ? (
          <button className="btn btn-gold btn-lg btn-full" disabled={!canStart} onClick={() => startGame(code)}>
            🎮 Lancer la partie !
          </button>
        ) : (
          <div className="waiting-host-btn">
            <div className="pulse-ring" />
            <span>En attente que l'hôte lance la partie...</span>
          </div>
        )}
      </div>
    </div>
  );
}
