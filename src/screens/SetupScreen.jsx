import { useState } from 'react';
import { PLAYER_EMOJIS } from '../data/themes';

const DEFAULT_NAMES = ['Joueur 1','Joueur 2','Joueur 3','Joueur 4','Joueur 5','Joueur 6','Joueur 7','Joueur 8'];

function makePlayer(i) {
  return { id: i, name: DEFAULT_NAMES[i], emoji: PLAYER_EMOJIS[i] };
}

export default function SetupScreen({ onBack, onStart }) {
  const [count, setCount] = useState(3);
  const [players, setPlayers] = useState(() => Array.from({length:8}, (_,i) => makePlayer(i)));
  const [rounds, setRounds] = useState(5);
  const [emojiPicker, setEmojiPicker] = useState(null); // index

  const visiblePlayers = players.slice(0, count);
  const usedEmojis = visiblePlayers.map(p => p.emoji);

  const updateName = (i, name) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? {...p, name: name || `Joueur ${i+1}`} : p));
  };

  const updateEmoji = (i, emoji) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? {...p, emoji} : p));
    setEmojiPicker(null);
  };

  const canStart = visiblePlayers.every(p => p.name.trim().length > 0);

  return (
    <div className="screen setup-screen">
      <div className="screen-header">
        <button className="btn btn-ghost" style={{padding:'8px',fontSize:'20px'}} onClick={onBack}>←</button>
        <span className="screen-header-title">Configuration</span>
        <div style={{width:44}} />
      </div>

      <div className="screen-scroll">
        <div className="setup-content">

          {/* Nombre de joueurs */}
          <div>
            <div className="setup-section-title">Nombre de joueurs</div>
            <div className="player-count-control">
              <button className="count-btn" onClick={() => setCount(c => Math.max(2, c-1))} disabled={count<=2}>−</button>
              <span className="count-display">{count}</span>
              <button className="count-btn" onClick={() => setCount(c => Math.min(8, c+1))} disabled={count>=8}>+</button>
            </div>
          </div>

          {/* Nombre de manches */}
          <div>
            <div className="setup-section-title">Nombre de manches</div>
            <div className="rounds-options">
              {[3,5,8,count].filter((v,i,a) => a.indexOf(v) === i && v >= 1).sort((a,b)=>a-b).map(r => (
                <div
                  key={r}
                  className={`round-option ${rounds === r ? 'selected' : ''}`}
                  onClick={() => setRounds(r)}
                >
                  {r}
                  <span>{r === count ? 'Égal' : r === 3 ? 'Court' : r === 5 ? 'Normal' : 'Long'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Liste joueurs */}
          <div>
            <div className="setup-section-title">Joueurs</div>
            <div className="player-list">
              {visiblePlayers.map((p, i) => (
                <div key={p.id} className="player-row">
                  <button className="player-emoji-btn" onClick={() => setEmojiPicker(i)}>
                    {p.emoji}
                  </button>
                  <input
                    className="player-name-input"
                    value={p.name}
                    onChange={e => updateName(i, e.target.value)}
                    placeholder={`Joueur ${i+1}`}
                    maxLength={16}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{height: 16}} />
        </div>
      </div>

      <div style={{padding:'0 20px 24px'}}>
        <button
          className="btn btn-gold btn-lg btn-full"
          disabled={!canStart}
          onClick={() => onStart(visiblePlayers, rounds)}
        >
          🎮 Lancer la partie !
        </button>
      </div>

      {/* Emoji picker */}
      {emojiPicker !== null && (
        <div className="emoji-picker-overlay" onClick={() => setEmojiPicker(null)}>
          <div className="emoji-picker" onClick={e => e.stopPropagation()}>
            <div className="emoji-picker-title">Choisissez un avatar</div>
            <div className="emoji-grid">
              {PLAYER_EMOJIS.map(e => {
                const taken = usedEmojis.includes(e) && players[emojiPicker]?.emoji !== e;
                return (
                  <div
                    key={e}
                    className={`emoji-option ${taken ? 'taken' : ''}`}
                    onClick={() => !taken && updateEmoji(emojiPicker, e)}
                  >
                    {e}
                  </div>
                );
              })}
            </div>
            <button className="btn btn-outline btn-full" onClick={() => setEmojiPicker(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
