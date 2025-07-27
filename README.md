# Token Manager

Un gestionnaire de tokens avec authentification JWT, interface graphique SvelteKit et tests E2E.

## 🏗️ Architecture

```
token-manager/
├── server/          # API Fastify + Prisma + Base de données
├── dashboard/       # Interface SvelteKit
├── scripts/         # Scripts utilitaires
├── tests/           # Tests E2E Playwright
└── docker-compose.* # Configuration Docker
```

## 🚀 Démarrage rapide

### Développement

```bash
# Installer les dépendances
npm install
cd server && npm install
cd ../dashboard && npm install

# Configurer les hosts (macOS/Linux)
npm run setup:hosts

# Lancer l'environnement de développement
npm run docker:dev

# Accéder aux services :
# - Dashboard: http://token-manager.dashboard.localhost
# - API: http://token-manager.server.localhost
# - Prisma Studio: http://token-manager.prisma.localhost
# - Traefik: http://localhost:8080
```

### Production

```bash
npm run docker:prod
```

## 📋 Commandes disponibles

### Serveur & Base de données

```bash
npm run dev              # Développement serveur
npm run build            # Build serveur
npm run start            # Démarrage serveur
npm run db:seed          # Seed base de données
npm run db:reset         # Reset + seed base de données
npm run db:studio        # Prisma Studio
```

### Dashboard

```bash
npm run dashboard:dev    # Développement dashboard
npm run dashboard:build  # Build dashboard
npm run dashboard:preview # Preview dashboard
```

### Tests

```bash
npm run test:e2e         # Tests E2E
npm run test:e2e:ui      # Tests E2E avec UI
npm run test:e2e:debug   # Tests E2E en mode debug
```

### Docker

```bash
npm run docker:dev       # Environnement de développement
npm run docker:prod      # Environnement de production
npm run docker:dev:down  # Arrêter l'environnement dev
npm run docker:prod:down # Arrêter l'environnement prod
```

### Utilitaires

```bash
npm run setup:hosts      # Configurer les hosts
npm run diagnose         # Diagnostic de l'environnement
npm run check:env        # Vérifier les variables d'environnement
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Base de données
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=token_manager_db
DB_PORT=5432

# Application
APP_PORT=3000
DASHBOARD_PORT=80

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Admin utilisateur
ADMIN_EMAIL=admin@token-manager.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator

# Tests
TEST_ENV=dev
BASE_URL=http://token-manager.server.localhost
```

## 🧪 Tests

Les tests E2E utilisent Playwright et testent l'ensemble de l'application :

- Authentification JWT
- Gestion des utilisateurs
- Gestion des thèmes
- Gestion des tokens
- Gestion des groupes

### Exécuter les tests

```bash
# Tests rapides (utilise l'admin existant)
npm run test:e2e

# Tests avec nettoyage complet
npm run test:e2e:clean

# Tests avec interface graphique
npm run test:e2e:ui

# Tests en mode debug
npm run test:e2e:debug
```

## 📁 Structure détaillée

### `server/`

- `src/` - Code source de l'API Fastify
- `prisma/` - Schéma et seed de la base de données
- `dist/` - Fichiers compilés
- `package.json` - Dépendances serveur + DB
- `esbuild.config.cjs` - Configuration de build
- `Dockerfile` - Image Docker

### `dashboard/`

- `src/` - Code source SvelteKit
- `static/` - Assets statiques
- `package.json` - Dépendances dashboard
- `Dockerfile` - Image Docker

### `scripts/`

- `test-e2e.sh` - Script de tests E2E
- `setup-hosts.sh` - Configuration des hosts
- `diagnose.sh` - Diagnostic
- `switch-env.sh` - Changement d'environnement
- `deploy.sh` - Déploiement
- `restore-db.sh` - Restauration DB

## 🔍 Diagnostic

En cas de problème, utilisez :

```bash
npm run diagnose
```

Cela vérifiera :

- L'état des conteneurs Docker
- La connectivité des services
- La configuration des hosts
- Les variables d'environnement

## 📝 Logs

```bash
# Logs de développement
npm run docker:dev:logs

# Logs spécifiques
npm run docker:dev:traefik
npm run docker:dev:playwright
npm run docker:dev:studio
npm run docker:dev:dashboard
```
