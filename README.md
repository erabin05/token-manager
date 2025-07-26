# Token Manager

Application de gestion de tokens avec Fastify, Prisma et PostgreSQL.

## 🚀 Configuration de Build et Déploiement

### Build avec Esbuild

Le projet utilise **esbuild** pour builder l'application TypeScript en JavaScript optimisé.

```bash
# Build de l'application
npm run build

# Build en mode watch
npm run build:watch

# Lancer l'application buildée
npm run start
```

### Docker

#### Développement

```bash
# Lancer l'environnement de développement (en arrière-plan)
npm run docker:dev

# Voir les logs en temps réel
npm run docker:dev:logs

# Ou lancer directement avec logs
docker-compose -f docker-compose.dev.yml --project-name token-manager-dev up --build
```

#### Production

```bash
# Déployer en production
npm run deploy
# ou
npm run docker:prod

# Arrêter la production
npm run docker:prod:down
```

### Scripts disponibles

- `npm run dev` - Développement avec hot reload
- `npm run build` - Build avec esbuild
- `npm run start` - Lance l'application buildée
- `npm run docker:dev` - Docker en développement (arrière-plan)
- `npm run docker:dev:logs` - Voir les logs de développement
- `npm run docker:dev:down` - Arrêter l'environnement de développement
- `npm run docker:dev:restart` - Redémarrer l'environnement de développement
- `npm run docker:prod` - Docker en production
- `npm run deploy` - Déploiement complet en production

## 📁 Structure du projet

```
token-manager/
├── src/                    # Code source TypeScript
├── dist/                   # Code buildé avec esbuild
├── prisma/                 # Schéma et migrations Prisma
├── tests/                  # Tests Playwright
├── docker-compose.dev.yml  # Configuration Docker développement
├── docker-compose.prod.yml # Configuration Docker production
├── Dockerfile.prod         # Dockerfile optimisé pour production
└── esbuild.config.cjs      # Configuration esbuild
```

## 🔧 Configuration

### Variables d'environnement

```bash
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/token_manager_db

# Application
NODE_ENV=development
```

## 🛠️ Développement

1. Installer les dépendances : `npm install`
2. Configurer la base de données : `npx prisma migrate dev`
3. Lancer en développement : `npm run dev`

## 🚀 Déploiement

1. Build de l'application : `npm run build`
2. Test local : `npm run start`
3. Déploiement Docker : `npm run deploy`

## 📚 Documentation

Voir `BUILD.md` pour plus de détails sur la configuration de build et de déploiement.
