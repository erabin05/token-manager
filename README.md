# Token Manager

Un projet Node.js avec TypeScript, Prisma ORM et PostgreSQL, conteneurisé avec Docker.

## Architecture

- **Backend**: Node.js avec TypeScript et Express
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Conteneurisation**: Docker avec docker-compose
- **Formatage**: Prettier

## Structure du projet

```
token-manager/
├── src/
│   └── server.ts          # Serveur Express
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   ├── seed.ts           # Script de données de test
│   └── migrations/       # Migrations de base de données
├── Dockerfile            # Configuration Docker pour l'app
├── docker-compose.yml    # Orchestration des services
├── package.json          # Dépendances Node.js
├── tsconfig.json         # Configuration TypeScript
├── .prettierrc           # Configuration Prettier
└── .prettierignore       # Fichiers ignorés par Prettier
```

## Services Docker

- **db**: PostgreSQL 15
- **app**: Serveur Node.js avec TypeScript et Prisma

## Modèles de données

### User

- `id`: Identifiant unique
- `email`: Email unique
- `name`: Nom de l'utilisateur

### Token

- `id`: Identifiant unique
- `name`: Nom du design token (ex: "primary-color", "border-radius")
- `tokenValues`: Relation one-to-many avec TokenValue
- `createdAt`: Date de création
- `updatedAt`: Date de modification

### TokenValue

- `id`: Identifiant unique
- `value`: Valeur du design token (string pour le moment)
- `tokenId`: Référence vers le Token parent
- `token`: Relation many-to-one avec Token
- `createdAt`: Date de création
- `updatedAt`: Date de modification

## Démarrage rapide

1. **Cloner le projet**

   ```bash
   git clone <repository-url>
   cd token-manager
   ```

2. **Lancer les services**

   ```bash
   docker-compose up -d
   ```

3. **Créer les migrations et insérer les données de test**

   ```bash
   docker-compose exec app npx prisma migrate dev --name init
   docker-compose exec app npx ts-node prisma/seed.ts
   ```

4. **Tester l'API**
   ```bash
   curl http://localhost:3000/users
   curl http://localhost:3000/tokens
   ```

## API Endpoints

### GET /users

Retourne la liste des utilisateurs.

**Réponse:**

```json
[
  {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice"
  }
]
```

### GET /tokens

Retourne la liste de tous les design tokens avec leurs values.

**Réponse:**

```json
[
  {
    "id": 1,
    "name": "primary-color",
    "createdAt": "2025-07-26T08:35:28.127Z",
    "updatedAt": "2025-07-26T08:35:28.127Z",
    "tokenValues": [
      {
        "id": 1,
        "value": "#007bff",
        "tokenId": 1,
        "createdAt": "2025-07-26T08:35:28.127Z",
        "updatedAt": "2025-07-26T08:35:28.127Z"
      },
      {
        "id": 2,
        "value": "#0056b3",
        "tokenId": 1,
        "createdAt": "2025-07-26T08:35:28.127Z",
        "updatedAt": "2025-07-26T08:35:28.127Z"
      },
      {
        "id": 3,
        "value": "#004085",
        "tokenId": 1,
        "createdAt": "2025-07-26T08:35:28.127Z",
        "updatedAt": "2025-07-26T08:35:28.127Z"
      }
    ]
  },
  {
    "id": 2,
    "name": "border-radius",
    "createdAt": "2025-07-26T08:35:28.130Z",
    "updatedAt": "2025-07-26T08:35:28.130Z",
    "tokenValues": [
      {
        "id": 4,
        "value": "4px",
        "tokenId": 2,
        "createdAt": "2025-07-26T08:35:28.130Z",
        "updatedAt": "2025-07-26T08:35:28.130Z"
      },
      {
        "id": 5,
        "value": "8px",
        "tokenId": 2,
        "createdAt": "2025-07-26T08:35:28.130Z",
        "updatedAt": "2025-07-26T08:35:28.130Z"
      }
    ]
  }
]
```

### GET /tokens/:id

Retourne un design token spécifique avec toutes ses values.

**Paramètres:**

- `id`: Identifiant du token

**Réponse:**

```json
{
  "id": 1,
  "name": "primary-color",
  "createdAt": "2025-07-26T08:35:28.127Z",
  "updatedAt": "2025-07-26T08:35:28.127Z",
  "tokenValues": [
    {
      "id": 1,
      "value": "#007bff",
      "tokenId": 1,
      "createdAt": "2025-07-26T08:35:28.127Z",
      "updatedAt": "2025-07-26T08:35:28.127Z"
    }
  ]
}
```

## Design Tokens inclus

Le projet inclut des exemples de design tokens courants :

- **primary-color** : Couleurs primaires (#007bff, #0056b3, #004085)
- **border-radius** : Rayons de bordure (4px, 8px, 12px, 16px)
- **font-size** : Tailles de police (12px, 14px, 16px, 18px, 24px, 32px)
- **spacing** : Espacements (4px, 8px, 16px, 24px, 32px, 48px)

## Commandes utiles

- **Voir les logs**: `docker-compose logs app`
- **Arrêter les services**: `docker-compose down`
- **Reconstruire l'image**: `docker-compose build`
- **Accéder au container**: `docker-compose exec app sh`
- **Formater le code**: `npm run format`
- **Vérifier le formatage**: `npm run format:check`

## Variables d'environnement

Le fichier `.env` contient :

```
DATABASE_URL=postgresql://user:password@db:5432/token_manager_db
```

## Développement

Pour le développement local sans Docker :

1. **Installer les dépendances**

   ```bash
   npm install
   ```

2. **Configurer la base de données**
   - Modifier `DATABASE_URL` dans `.env`
   - Lancer PostgreSQL localement

3. **Générer le client Prisma**

   ```bash
   npx prisma generate
   ```

4. **Appliquer les migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Lancer le serveur**
   ```bash
   npm run dev
   ```

## Formatage du code

Le projet utilise Prettier pour maintenir un style de code cohérent.

**Configuration Prettier :**

- Guillemets simples
- Point-virgule à la fin des lignes
- Largeur maximale de 80 caractères
- Indentation de 2 espaces
- Virgules trailing ES5

**Commandes :**

- `npm run format` : Formate tous les fichiers
- `npm run format:check` : Vérifie le formatage sans modifier
