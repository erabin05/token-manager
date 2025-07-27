# Token Manager Dashboard

Interface graphique SvelteKit pour le Token Manager.

## 🚀 Démarrage rapide

### Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
open http://localhost:5173
```

### Avec Docker (recommandé)

```bash
# Depuis la racine du projet
npm run docker:switch:dev

# Accéder au dashboard
open http://token-manager.dashboard.localhost
```

## 📁 Structure du projet

```
dashboard/
├── src/
│   ├── routes/           # Pages SvelteKit
│   │   ├── +page.svelte  # Page de login
│   │   └── dashboard/    # Pages protégées
│   ├── lib/              # Utilitaires et composants
│   └── app.html          # Template HTML principal
├── static/               # Assets statiques
├── Dockerfile            # Image de développement
├── Dockerfile.prod       # Image de production
└── nginx.conf           # Configuration nginx (prod)
```

## 🔐 Authentification

Le dashboard utilise l'authentification JWT avec le serveur backend :

1. **Login** : Page de connexion avec email/mot de passe
2. **Protection** : Routes protégées redirigent vers login si non authentifié
3. **Stockage** : Tokens stockés dans localStorage
4. **API** : Proxy vers le serveur backend via `/api/auth/login`

## 🐳 Déploiement

### Développement

- HMR activé avec Vite
- Proxy API vers le serveur backend
- Volumes montés pour le hot reload

### Production

- Build statique avec Vite
- Servi par nginx
- Optimisé pour les performances

## 🔧 Configuration

### Variables d'environnement

- `VITE_API_URL` : URL de l'API backend (défaut: http://token-manager.server.localhost)

### URLs d'accès

- **Dev** : http://token-manager.dashboard.localhost
- **Prod** : http://localhost:3001

## 📝 Scripts disponibles

```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run preview      # Prévisualiser le build
```

## 🧪 Tests

Les tests e2e incluent le dashboard et sont lancés depuis la racine du projet :

```bash
npm run test:e2e
```
