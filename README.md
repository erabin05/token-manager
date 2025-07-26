# Token Manager

A Node.js project with TypeScript, Prisma ORM, and PostgreSQL, containerized with Docker.

## Architecture

- **Backend**: Node.js with TypeScript and Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker with docker-compose
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
token-manager/
├── src/
│   ├── server.ts           # Fastify server
│   └── routes/             # Modular API routes
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script for mock data
│   └── migrations/         # Database migrations
├── .husky/                 # Git hooks
│   └── pre-commit          # Pre-commit hook
├── Dockerfile              # Docker config for the app
├── docker-compose.yml      # Service orchestration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript config
├── .prettierrc             # Prettier config
└── .prettierignore         # Files ignored by Prettier
```

## Docker Services

- **db**: PostgreSQL 15
- **app**: Node.js server with TypeScript and Prisma
- **app-dev**: Hot-reload dev server (ts-node-dev)

## Data Models

### User

- `id`: Unique identifier
- `email`: Unique email
- `name`: User name

### Token

- `id`: Unique identifier
- `name`: Design token name (e.g. "primary-color", "border-radius")
- `tokenValues`: One-to-many relation with TokenValue
- `groupId`: Optional group reference
- `createdAt`: Creation date
- `updatedAt`: Update date

### TokenValue

- `id`: Unique identifier
- `value`: Value of the design token (string)
- `tokenId`: Reference to parent Token
- `themeId`: Reference to Theme
- `createdAt`: Creation date
- `updatedAt`: Update date

### TokenGroup

- `id`: Unique identifier
- `name`: Group name
- `parentId`: Optional parent group (for nesting)
- `tokens`: Tokens in this group
- `children`: Sub-groups
- `createdAt`: Creation date
- `updatedAt`: Update date

### Theme

- `id`: Unique identifier
- `name`: Theme name (unique)
- `parentId`: Optional parent theme (for inheritance)
- `tokenValues`: Token values for this theme
- `createdAt`: Creation date
- `updatedAt`: Update date
- `children`: Sub-themes

## Quick Start

1. **Clone the project**
   ```bash
   git clone git@github.com:erabin05/token-manager.git
   cd token-manager
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the services**
   ```bash
   docker-compose up db app-dev
   ```
4. **Seed the database**
   ```bash
   docker-compose exec app-dev npm run prisma:seed
   ```
5. **Test the API**
   - Use the provided `test-api.http` file with the REST Client extension in your editor
   - Or use curl:
     ```bash
     curl http://localhost:3001/users
     curl http://localhost:3001/tokens
     ```

## API Endpoints

### GET /users

Returns the list of users.

### GET /tokens

Returns all design tokens with their values and themes.

### GET /tokens/:id

Returns a specific token with all its values and themes.

### GET /themes

Returns the list of themes (without tokens).

### GET /groups

Returns all groups in a nested tree structure (groups only).

### GET /groups/:id

Returns a group with its direct child groups and direct tokens.

## Included Design Tokens

The project includes mock data for common design tokens:

- **primary-color**: e.g. #007bff, #4dabf7
- **border-radius**: e.g. 4px, 6px
- **font-size**: e.g. 16px, 18px
- **spacing**: e.g. 16px, 20px

## Useful Commands

- **View logs**: `docker-compose logs app-dev`
- **Stop services**: `docker-compose down`
- **Rebuild image**: `docker-compose build`
- **Access the container**: `docker-compose exec app-dev sh`
- **Format code**: `npm run format`
- **Check formatting**: `npm run format:check`

## Environment Variables

The `.env` file contains:

```
DATABASE_URL=postgresql://user:password@db:5432/token_manager_db
```

## Development (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure the database**
   - Edit `DATABASE_URL` in `.env`
   - Start PostgreSQL locally
3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```
4. **Apply migrations**
   ```bash
   npx prisma migrate dev
   ```
5. **Start the server**
   ```bash
   npm run dev
   ```

## Code Formatting

The project uses Prettier for consistent code style.

**Prettier config:**

- Single quotes
- Semicolons
- Max width: 80
- Indent: 2 spaces
- Trailing commas: ES5

**Commands:**

- `npm run format`: Format all files
- `npm run format:check`: Check formatting only

## Git Hooks

The project uses **Husky** and **lint-staged** to automate code formatting.

- **Pre-commit hook**: Runs automatically before each commit
- **lint-staged**: Formats only staged files with Prettier
- **Validation**: Commit is blocked if formatting fails
- **Script prepare**: Installs hooks automatically on `npm install`

---

Feel free to open issues or contribute!
