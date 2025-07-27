FROM node:20-alpine

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Générer les types SvelteKit
RUN npm run build

# Exposer le port
EXPOSE 5173

# Commande par défaut (sera surchargée dans docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 