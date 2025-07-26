#!/bin/bash

# Script de déploiement pour la production
set -e

echo "🚀 Déploiement en production..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml --project-name token-manager-prod down

# Builder et démarrer les conteneurs
echo "🔨 Build et démarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml --project-name token-manager-prod up --build -d

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Vérifier que l'application fonctionne
echo "🔍 Vérification de l'application..."
if curl -f http://localhost:${APP_PORT:-3000}/health > /dev/null 2>&1; then
    echo "✅ Application déployée avec succès!"
    echo "🌐 Application accessible sur http://localhost:${APP_PORT:-3000}"
else
    echo "❌ L'application ne répond pas"
    echo "📋 Logs de l'application:"
    docker-compose -f docker-compose.prod.yml --project-name token-manager-prod logs app
    exit 1
fi 