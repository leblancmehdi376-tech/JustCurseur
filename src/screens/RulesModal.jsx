export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-content">
          <div className="modal-title">📖 Règles du Jeu</div>

          <div className="rule-block">
            <div className="rule-block-title">🎯 Le Concept</div>
            <p>Un joueur devient <strong style={{color:'var(--gold)'}}>Maître du Jeu</strong>. Il reçoit une note secrète entre 1 et 10 et un thème. Il propose un indice. Les autres devinent la note !</p>
          </div>

          <div className="rule-block">
            <div className="rule-block-title">🔄 Déroulement d'un Tour</div>
            <ul>
              <li>Le MJ voit la note secrète + le thème</li>
              <li>Il écrit un indice correspondant à cette note</li>
              <li>Chaque joueur vote secrètement entre 1 et 10</li>
              <li>La jauge révèle dramatiquement la note secrète</li>
            </ul>
          </div>

          <div className="rule-block">
            <div className="rule-block-title">🪙 Points — Joueurs</div>
            <ul>
              <li><strong style={{color:'var(--gold)'}}>Pile-Poil</strong> : note exacte → +2 points</li>
              <li><strong style={{color:'var(--cyan)'}}>Tout Près</strong> : ±1 de la note → +1 point</li>
              <li>Pile-Poil consécutifs : points doublés !</li>
            </ul>
          </div>

          <div className="rule-block">
            <div className="rule-block-title">👑 Points — Maître du Jeu</div>
            <ul>
              <li>+1 point par joueur ayant trouvé exactement</li>
              <li><strong style={{color:'var(--red)'}}>Piège du Trop Facile</strong> : si <em>tous</em> trouvent → 0 point pour le MJ !</li>
            </ul>
          </div>

          <div className="rule-block">
            <div className="rule-block-title">⚡ Jeton All-In</div>
            <ul>
              <li>Un seul jeton par partie par joueur</li>
              <li>Note exacte avec All-In → +4 points</li>
              <li>Raté avec All-In → -1 point (même si Tout Près)</li>
            </ul>
          </div>

          <div className="rule-block">
            <div className="rule-block-title">🎭 Thèmes</div>
            <ul>
              <li>🍕 Cuisine — niveau de gastronomie</li>
              <li>🎌 Animé — qualité / popularité</li>
              <li>😭 Douleur — niveau d'inconfort</li>
              <li>😬 Malaise Social — honte sociale</li>
              <li>🎲 Subjectif Total — le MJ décide !</li>
            </ul>
          </div>

          <button className="btn btn-gold btn-full" onClick={onClose} style={{marginTop: 8}}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
