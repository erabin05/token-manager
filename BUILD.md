# Build and Deployment Configuration

This document provides detailed information about the build system and deployment configuration for the Token Manager project.

## 🏗️ Build System Configuration

This project uses **esbuild** for fast TypeScript compilation and bundling, providing significant performance improvements over traditional TypeScript compilation.

### Available Scripts

- `npm run build` - Build the application with esbuild
- `npm run build:watch` - Build in watch mode (automatic rebuilds)
- `npm run start` - Run the built application

### Esbuild Configuration

The `esbuild.config.cjs` file configures:

- Bundle all modules into a single file
- Target Node.js 20
- CommonJS format for compatibility
- Source maps in development
- Minification in production
- External `@prisma/client` (handled separately)

## 🐳 Docker Configuration

### Development Environment

```bash
# Start development environment
npm run docker:dev

# Or directly
docker-compose -f docker-compose.dev.yml --project-name token-manager-dev up --build
```

### Production Environment

```bash
# Deploy to production
npm run deploy

# Or manually
npm run docker:prod

# Stop production
npm run docker:prod:down
```

### Docker Files

- `Dockerfile` - For development (with hot reload)
- `Dockerfile.prod` - For production (optimized, multi-stage)

### Docker Compose Files

- `docker-compose.dev.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration

## 🔧 Environment Variables

### Production

```bash
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=token_manager_db
DB_PORT=5432

# Application
APP_PORT=3000
NODE_ENV=production
```

## 🔄 Development Workflow

1. **Local Development**: `npm run dev`
2. **Build**: `npm run build`
3. **Local Testing**: `npm run start`
4. **Deployment**: `npm run deploy`

## 🚀 Benefits of This Configuration

- **Performance**: esbuild is much faster than tsc
- **Optimized Bundle**: Single JavaScript file
- **Security**: Non-root user in production
- **Multi-stage Builds**: Smaller Docker images
- **Hot Reload**: Smoother development experience

## 🧪 Testing

### End-to-End Tests

The project includes Playwright tests that run against the built application:

```bash
# Run e2e tests with build
./scripts/test-e2e.sh

# Or manually
npm run build
npx playwright test
```

### Test Environment

Tests use a separate Docker environment (`docker-compose.test.yml`) to ensure isolation and consistency.

## 📦 Deployment Scripts

### Production Deployment

The `scripts/deploy.sh` script provides a complete deployment workflow:

1. Stops existing containers
2. Builds and starts new containers
3. Waits for database readiness
4. Verifies application health
5. Provides deployment status

### Usage

```bash
# Full deployment
npm run deploy

# Manual deployment
npm run docker:prod
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure no other services are using ports 3000, 3001, or 5432
2. **Docker Permissions**: Make sure Docker is running and you have proper permissions
3. **Database Connection**: Verify database credentials and network connectivity

### Logs

```bash
# Development logs
npm run docker:dev:logs

# Production logs
docker-compose -f docker-compose.prod.yml --project-name token-manager-prod logs app
```

## 📚 Additional Resources

- [esbuild Documentation](https://esbuild.github.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/)
