# Dockerfile pour le serveur Node.js
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc
EXPOSE 3000
CMD ["npx", "ts-node", "src/server.ts"] 