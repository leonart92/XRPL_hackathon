# Déploiement sur Railway

## Fichiers de configuration créés

- **`server.ts`** - Serveur Bun combiné (frontend + API)
- **`Dockerfile`** - Configuration Docker avec Bun
- **`railway.toml`** - Configuration Railway
- **`.dockerignore`** - Exclusions pour Docker build
- **`package.json`** - Ajout du script `start`

## Étapes pour déployer sur Railway

### 1. Préparer le projet

Assure-toi que ton projet est dans un repo Git :

```bash
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### 2. Créer un compte Railway

1. Va sur https://railway.app
2. Connecte-toi avec GitHub (gratuit)
3. Tu obtiens $5 de crédit gratuit/mois

### 3. Créer un nouveau projet

1. Clique sur **"New Project"**
2. Sélectionne **"Deploy from GitHub repo"**
3. Choisis ton repo `XRPL_hackathon`
4. Railway va détecter automatiquement le `Dockerfile`

### 4. Configurer les variables d'environnement

Dans le dashboard Railway, va dans **Variables** et ajoute :

```bash
VITE_REGISTRY_ADDRESS=rUTZUX7DEtx3ytmS5pFLhquMuUaPx27mtt
VITE_REGISTRY_SEED=<ton_registry_seed>
REGISTRY_SEED=<ton_registry_seed>
XRPL_NETWORK=testnet
NODE_ENV=production
```

> ⚠️ **Important** : Ne commit JAMAIS tes seeds dans Git ! Utilise uniquement les variables d'environnement Railway.

### 5. Déployer

1. Railway va automatiquement build et déployer
2. Attends ~2-3 minutes pour le build
3. Railway te donnera une URL du type : `https://your-app.up.railway.app`

### 6. Tester le déploiement

Une fois déployé, teste :

```bash
# Frontend
curl https://your-app.up.railway.app

# API Health check
curl https://your-app.up.railway.app/api/deploy-vault -X OPTIONS
```

## Structure du déploiement

```
Railway Container
├── Frontend (dist/) → Servi à la racine "/"
└── API → Endpoints "/api/*"
    ├── /api/deploy-vault
    └── /api/harvest-yield
```

## Commandes utiles en local

```bash
# Build frontend
bun run build

# Tester le serveur de production en local
bun run start

# Le serveur sera dispo sur http://localhost:3000
```

## Monitoring

Dans le dashboard Railway :

- **Logs** : Voir les logs en temps réel
- **Metrics** : CPU, RAM, requêtes
- **Deployments** : Historique des déploiements

## Coûts

- **Gratuit** : $5/mois (~500h d'exécution)
- Ton app sera en ligne 24/7 pendant ~3-4 jours
- Parfait pour une démo !

## Troubleshooting

### Le build échoue ?
```bash
# Vérifie que le build fonctionne en local
bun run build
```

### Le serveur ne démarre pas ?
```bash
# Teste en local
bun run start
```

### Variables d'env manquantes ?
- Vérifie dans Railway > Variables que toutes les vars sont définies
- Redéploie après avoir ajouté les variables

## Alternative : Déploiement manuel avec Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link au projet
railway link

# Deploy
railway up
```

## Fichiers créés

- ✅ `server.ts` - Serveur combiné
- ✅ `Dockerfile` - Config Docker
- ✅ `railway.toml` - Config Railway
- ✅ `.dockerignore` - Exclusions
- ✅ `package.json` - Script `start`
- ✅ `DEPLOY.md` - Ce guide !
