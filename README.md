# Token Manager

A modern design token management system built with Fastify, Prisma, and PostgreSQL. This project provides a robust API for managing design tokens, themes, and user groups with a focus on performance and developer experience.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd token-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development environment**

   ```bash
   npm run docker:dev
   ```

4. **Access the API**
   - Main API: http://localhost:3000
   - Development API: http://localhost:3001
   - Health check: http://localhost:3000/health

## 🏗️ Build System

This project uses **esbuild** for fast TypeScript compilation and bundling.

```bash
# Build the application
npm run build

# Build in watch mode
npm run build:watch

# Run the built application
npm run start
```

## 🐳 Docker Environments

### Development

```bash
# Start development environment (background)
npm run docker:dev

# View real-time logs
npm run docker:dev:logs

# Stop development environment
npm run docker:dev:down

# Restart development environment
npm run docker:dev:restart
```

### Production

```bash
# Deploy to production
npm run deploy

# Or manually
npm run docker:prod

# Stop production
npm run docker:prod:down
```

## 📋 Available Scripts

- `npm run dev` - Development with hot reload
- `npm run build` - Build with esbuild
- `npm run start` - Run the built application
- `npm run docker:dev` - Docker development (background)
- `npm run docker:dev:logs` - View development logs
- `npm run docker:dev:down` - Stop development environment
- `npm run docker:dev:restart` - Restart development environment
- `npm run docker:dev:studio` - View Prisma Studio logs
- `npm run docker:prod` - Docker production
- `npm run deploy` - Complete production deployment
- `npm run check:env` - Vérifier l'état des environnements Docker
- `npm run docker:switch:dev` - Switcher vers l'environnement Docker de développement
- `npm run docker:switch:prod` - Switcher vers l'environnement Docker de production
- `npm run db:restore` - Restaurer la base de données avec les données de test (seed)
- `npm run test:users` - Créer des utilisateurs de test et afficher leurs IDs pour test-api.http

## 🧪 Testing

### End-to-End Tests

Le projet utilise Playwright pour les tests end-to-end. Vous pouvez choisir d'exécuter les tests sur l'environnement de développement ou de production :

#### Tests rapides (développement quotidien)

```bash
# Tests intelligents (détectent automatiquement l'environnement)
npm run test:e2e

# Interface utilisateur pour les tests
npm run test:e2e:ui:dev    # Interface sur dev
npm run test:e2e:ui:prod   # Interface sur prod

# Mode debug
npm run test:e2e:debug:dev  # Debug sur dev
npm run test:e2e:debug:prod # Debug sur prod
```

**Gestion intelligente des environnements Docker** : Les tests rapides :

- **Détectent** automatiquement l'environnement Docker actuel (dev ou prod)
- **Utilisent** l'environnement détecté (rapide)
- **Démarrent** l'environnement dev par défaut si aucun n'est actif
- **Affichent** l'environnement utilisé et la commande pour switcher

#### Tests avec nettoyage complet (CI/CD, validation)

```bash
# Tests avec nettoyage complet (utilise la même logique intelligente)
npm run test:e2e:clean
```

**Note** : Les tests intelligents (`npm run test:e2e`) sont maintenant suffisants pour la plupart des cas d'usage, y compris le développement quotidien et les validations.

## 📁 Project Structure

```
token-manager/
├── src/                    # TypeScript source code
├── dist/                   # Built code with esbuild
├── prisma/                 # Prisma schema and migrations
├── tests/                  # Playwright tests
├── test-api.http          # Fichier de test API avec authentification
├── docker-compose.dev.yml  # Docker development configuration
├── docker-compose.prod.yml # Docker production configuration
├── Dockerfile.prod         # Optimized production Dockerfile
└── esbuild.config.cjs      # esbuild configuration
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/token_manager_db

# Application
NODE_ENV=development
```

## 🛠️ Development Workflow

1. Install dependencies: `npm install`
2. Set up database: `npx prisma migrate dev`
3. Start development: `npm run dev`

## 🚀 Deployment

1. Build application: `npm run build`
2. Test locally: `npm run start`
3. Deploy with Docker: `npm run deploy`

## 📚 Documentation

See `BUILD.md` for detailed build and deployment configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:e2e:clean` (tests sur dev) ou `npm run test:e2e:clean:prod` (tests sur prod)
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
