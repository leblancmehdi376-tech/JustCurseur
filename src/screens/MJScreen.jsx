import PlayerAvatar from '../components/PlayerAvatar';
import { useState } from 'react';

export default function MJScreen({ player, theme, secretNote, currentRound, totalRounds, onSubmit }) {
  const [hint, setHint] = useState('');

  return (
    <div className="screen mj-screen">
      <div className="mj-header">
        <div>
          <div className="badge badge-gold">Manche {currentRound}/{totalRounds}</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <PlayerAvatar player={player} size={32} style={{ borderRadius: '50%' }} />
          <span style={{fontFamily:'var(--font-display)', fontSize:14, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--off-white)'}}>{player.name}</span>
          <div className="badge badge-cyan">MJ 👑</div>
        </div>
      </div>

      <div className="screen-scroll">
        <div className="mj-content">
          <div className="mj-crown">👑</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:13, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--muted)', marginBottom:6}}>Ta note secrète</div>
          </div>

          <div className="secret-note-reveal">
            <span className="secret-note-number">{secretNote}</span>
            <span className="secret-note-suffix">/10</span>
          </div>

          <div className="theme-card card-gold">
            <span className="theme-emoji-big">{theme.emoji}</span>
            <div className="theme-info">
              <div className="theme-name">{theme.name}</div>
              <div className="theme-scale">{theme.scale}</div>
            </div>
          </div>

          <div>
            <div className="hint-label">Ton indice pour {secretNote}/10</div>
            <textarea
              className="input"
              placeholder={`Ex: (Cuisine - ${secretNote}/10) → "Mettre du ketchup dans les pâtes au saumon"`}
              value={hint}
              onChange={e => setHint(e.target.value)}
              maxLength={200}
              autoFocus
            />
            <div style={{textAlign:'right', fontSize:11, color:'var(--muted)', marginTop:6, fontFamily:'var(--font-display)'}}>
              {hint.length}/200
            </div>
          </div>

          <div className="card" style={{background:'rgba(0,212,255,0.04)', borderColor:'rgba(0,212,255,0.15)'}}>
            <div style={{fontSize:12, color:'var(--cyan)', fontFamily:'var(--font-display)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8}}>
              💡 Stratégie
            </div>
            <p style={{fontSize:13, color:'var(--off-white)', lineHeight:1.6}}>
              Sois subtil ! Si <em>tous</em> trouvent ta note exacte, tu gagnes <strong style={{color:'var(--red)'}}>0 point</strong>. Le but : te faire comprendre sans être trop évident.
            </p>
          </div>

          <div style={{height: 16}} />
        </div>
      </div>

      <div style={{padding:'0 20px 24px'}}>
        <button
          className="btn btn-gold btn-lg btn-full"
          disabled={hint.trim().length < 3}
          onClick={() => onSubmit(hint.trim())}
        >
          ✅ Valider mon indice
        </button>
      </div>
    </div>
  );
}
