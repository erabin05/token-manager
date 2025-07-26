#!/bin/bash

# Script de test e2e avec build préalable
set -e

echo "🧪 Lancement des tests e2e..."

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build de l'application pour les tests
echo "🔨 Build de l'application pour les tests..."
npm run build

# Arrêter les conteneurs de test existants
echo "🛑 Arrêt des conteneurs de test existants..."
docker-compose -f docker-compose.test.yml --project-name token-manager-test down --volumes --remove-orphans 2>/dev/null || true

# Lancer les tests
echo "🚀 Lancement des tests e2e..."
npx playwright test

# Nettoyer après les tests
echo "🧹 Nettoyage après les tests..."
docker-compose -f docker-compose.test.yml --project-name token-manager-test down --volumes --remove-orphans

echo "✅ Tests e2e terminés!" 