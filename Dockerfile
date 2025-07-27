# Dockerfile pour le serveur Node.js
FROM node:20-alpine
WORKDIR /app

# Installer les dépendances système nécessaires pour bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install
# Reconstruire bcrypt pour l'architecture Alpine
RUN npm rebuild bcrypt --build-from-source
COPY . .
RUN npx prisma generate
RUN npx tsc
EXPOSE 3000
CMD ["npx", "ts-node", "src/server.ts"] 