# 🎯 Le Juste Curseur

Jeu de société numérique pour 2 à 8 joueurs — tour par tour sur un seul appareil.

## 🚀 Déploiement sur Vercel

### Option A — Vercel CLI (recommandée)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — Interface Web Vercel
1. Poussez le code sur GitHub/GitLab/Bitbucket
2. Allez sur [vercel.com](https://vercel.com) → **Add New Project**
3. Importez votre repo
4. Laissez Vercel auto-détecter Vite (framework preset déjà configuré)
5. Cliquez **Deploy** → c'est en ligne 🎉

## 🛠️ Développement local
```bash
npm install
npm run dev
# → http://localhost:5173
```

## 📁 Structure
```
src/
├── App.jsx              # Machine d'état principale
├── App.css              # Design system complet
├── data/
│   └── themes.js        # Thèmes & emojis
└── screens/
    ├── HomeScreen.jsx
    ├── SetupScreen.jsx
    ├── PassScreen.jsx
    ├── MJScreen.jsx
    ├── HintRevealScreen.jsx
    ├── VotingScreen.jsx
    ├── RevelationScreen.jsx
    ├── ScoresScreen.jsx
    ├── EndScreen.jsx
    └── RulesModal.jsx
```

## 🎮 Comment jouer
1. **Setup** — entrez les noms et avatars de chaque joueur
2. **MJ** — le Maître du Jeu reçoit une note secrète + un thème, il écrit un indice
3. **Vote** — chaque joueur vote secrètement entre 1 et 10
4. **Révélation** — la jauge monte dramatiquement jusqu'à la note secrète
5. **Scores** — Pile-Poil (+2), Tout Près (+1), All-In x2 l'enjeu
