# 🎮 Setup Discord Activity — Guide Complet

## Étape 1 — Créer l'app Discord
1. Va sur https://discord.com/developers/applications
2. **"New Application"** → nom : `Le Juste Curseur`
3. Mets une belle icône (tu peux utiliser le 🎯 en image PNG)

## Étape 2 — Activer les Activities
1. Dans le menu gauche → **"Activities"**
2. Active le toggle **"Enable Activities"**
3. **URL Mapping** → ajoute :
   - Prefix : `/`
   - Target : `le-juste-curseur.vercel.app`

## Étape 3 — OAuth2
1. Menu gauche → **OAuth2**
2. Note bien ton **Client ID**
3. Clique **"Reset Secret"** → note ton **Client Secret**
4. **Redirects** → ajoute : `https://le-juste-curseur.vercel.app`

## Étape 4 — Variables d'environnement sur Vercel
Dans Vercel → Settings → Environment Variables, ajoute :

```
VITE_DISCORD_CLIENT_ID = ton_client_id
DISCORD_CLIENT_SECRET  = ton_client_secret  ← jamais en VITE_ !
```

## Étape 5 — Tester en local
```bash
npm install -g @discord/activity-proxy
discord-activity-proxy
# → ouvre http://localhost:1234 dans Discord Desktop
```

## Étape 6 — Soumettre pour publication
1. Discord Developer Portal → **"Activities"** → **"Submit for Review"**
2. Discord examine l'app (quelques jours)
3. Une fois approuvé → apparaît dans la liste Activities de tous les salons vocaux 🎉

## En attendant l'approbation
Tu peux déjà tester avec tes amis en mode **dev** :
- Ouvre un salon vocal Discord
- Clique l'icône 🎮 Activities → ton app apparaît pour les gens dans ton serveur de dev

## Architecture Discord Activity
```
Discord Desktop
  └── iframe (discordsays.com)
        └── le-juste-curseur.vercel.app
              ├── @discord/embedded-app-sdk  ← auth Discord auto
              ├── Firebase Realtime DB       ← sync des parties
              └── /api/discord-token         ← échange OAuth2 (Vercel serverless)
```
