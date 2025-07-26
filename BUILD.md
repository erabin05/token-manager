# Configuration de Build et Déploiement

## Configuration Esbuild

Le projet utilise maintenant **esbuild** pour builder l'application TypeScript en JavaScript optimisé.

### Scripts disponibles

- `npm run build` - Build l'application avec esbuild
- `npm run build:watch` - Build en mode watch (reconstruction automatique)
- `npm run start` - Lance l'application buildée

### Configuration Esbuild

Le fichier `esbuild.config.js` configure :

- Bundle de tous les modules en un seul fichier
- Target Node.js 20
- Format CommonJS
- Sourcemaps en développement
- Minification en production
- Exclusion de `@prisma/client` (géré séparément)

## Docker

### Développement

```bash
# Lancer l'environnement de développement (en arrière-plan)
npm run docker:dev

# Voir les logs en temps réel
npm run docker:dev:logs

# Ou lancer directement avec logs
docker-compose -f docker-compose.dev.yml --project-name token-manager-dev up --build
```

### Production

```bash
# Déployer en production
npm run deploy

# Ou manuellement
npm run docker:prod

# Arrêter la production
npm run docker:prod:down
```

### Dockerfiles

- `Dockerfile` - Pour le développement (avec hot reload)
- `Dockerfile.prod` - Pour la production (optimisé, multi-stage)

### Docker Compose

- `docker-compose.dev.yml` - Configuration de développement
- `docker-compose.prod.yml` - Configuration de production

## Variables d'environnement

### Production

```bash
# Base de données
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=token_manager_db
DB_PORT=5432

# Application
APP_PORT=3000
NODE_ENV=production
```

## Workflow de développement

1. **Développement local** : `npm run dev`
2. **Build** : `npm run build`
3. **Test local** : `npm run start`
4. **Déploiement** : `npm run deploy`

## Avantages de cette configuration

- **Performance** : esbuild est beaucoup plus rapide que tsc
- **Bundle optimisé** : Un seul fichier JavaScript
- **Sécurité** : Utilisateur non-root en production
- **Multi-stage builds** : Images Docker plus petites
- **Hot reload** : Développement plus fluide
