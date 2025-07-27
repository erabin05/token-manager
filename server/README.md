# Token Manager Server

Serveur backend Fastify pour le Token Manager.

## 🚀 Démarrage rapide

### Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
open http://localhost:3000
```

### Avec Docker (recommandé)

```bash
# Depuis la racine du projet
npm run docker:switch:dev

# Accéder à l'API
open http://token-manager.server.localhost
```

## 📁 Structure du projet

```
server/
├── src/
│   ├── routes/           # Routes API
│   │   ├── auth.ts       # Authentification
│   │   ├── users.ts      # Gestion des utilisateurs
│   │   ├── tokens.ts     # Gestion des tokens
│   │   ├── themes.ts     # Gestion des thèmes
│   │   ├── groups.ts     # Gestion des groupes
│   │   └── health.ts     # Health check
│   ├── lib/
│   │   ├── auth.ts       # Middleware d'authentification
│   │   └── prisma.ts     # Configuration Prisma
│   └── server.ts         # Point d'entrée
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── seed.ts          # Données initiales
├── dist/                 # Fichiers compilés
├── Dockerfile            # Image de développement
├── Dockerfile.prod       # Image de production
└── package.json
```

## 🔐 Authentification

Le serveur utilise l'authentification JWT :

- **Login** : `POST /auth/login`
- **Refresh** : `POST /auth/refresh`
- **Logout** : `POST /auth/logout`
- **Me** : `GET /auth/me`

## 🗄️ Base de données

Utilise PostgreSQL avec Prisma ORM :

```bash
# Générer le client Prisma
npm run prisma:generate

# Pousser le schéma vers la DB
npm run prisma:push

# Lancer Prisma Studio
npm run prisma:studio
```

## 📝 Scripts disponibles

```bash
npm run dev          # Développement avec hot reload
npm run build        # Build de production
npm run start        # Démarrer en production
npm run prisma:seed  # Peupler la base de données
```

## 🔧 Configuration

### Variables d'environnement

- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète pour les JWT
- `JWT_REFRESH_SECRET` : Clé secrète pour les refresh tokens
- `ADMIN_EMAIL` : Email de l'admin par défaut
- `ADMIN_PASSWORD` : Mot de passe de l'admin par défaut
- `ADMIN_NAME` : Nom de l'admin par défaut

## 🧪 Tests

Les tests e2e sont lancés depuis la racine du projet :

```bash
npm run test:e2e
```
