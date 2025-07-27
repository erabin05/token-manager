FROM node:20-alpine

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.cjs ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Générer le client Prisma et compiler
RUN npm run prisma:generate
RUN npm run build

# Exposer le port pour Prisma Studio (optionnel)
EXPOSE 5555

# Commande par défaut (peut être surchargée)
CMD ["npm", "run", "prisma:studio"] 