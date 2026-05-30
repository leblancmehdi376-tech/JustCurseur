# 🔥 Setup Firebase — 5 minutes chrono

## Étape 1 — Créer le projet Firebase
1. Va sur https://console.firebase.google.com
2. **"Add project"** → nom : `JustCurseur` → Continue
3. Désactive Google Analytics (inutile) → **Create project**

## Étape 2 — Activer Realtime Database
1. Dans le menu gauche : **Build → Realtime Database**
2. **Create Database** → choisis une région (ex: `europe-west1`)
3. Choisis **"Start in test mode"** (pour commencer) → Enable

### Règles de sécurité (colle ça dans l'onglet "Rules") :
```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
Clique **Publish**.

## Étape 3 — Activer Authentication
1. **Build → Authentication → Get started**
2. **Sign-in method** → Active **Anonymous** (pour les invités)
3. *(Optionnel)* Active aussi **Google** pour la connexion Google

## Étape 4 — Récupérer la config
1. ⚙️ (icône engrenage) → **Project settings**
2. Descends jusqu'à **"Your apps"** → clique l'icône `</>`
3. Nom : `JustCurseur Web` → **Register app**
4. Copie le bloc `firebaseConfig`

## Étape 5 — Créer le fichier .env
Dans le dossier du projet, crée un fichier `.env` :

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=justcurseur-xxxxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://justcurseur-xxxxx-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=justcurseur-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=justcurseur-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

⚠️ **Ne commite jamais le `.env` sur GitHub !** (déjà dans .gitignore)

## Étape 6 — Variables sur Vercel
1. Dashboard Vercel → ton projet → **Settings → Environment Variables**
2. Ajoute chaque variable `VITE_FIREBASE_*` avec sa valeur
3. **Redéploie** le projet

## Étape 7 — Autoriser ton domaine Vercel
1. Firebase console → **Authentication → Settings → Authorized domains**
2. Ajoute ton domaine Vercel (ex: `just-curseur.vercel.app`)

## C'est tout ! 🎉
Lance `npm run dev` en local ou pousse sur GitHub pour déployer.
