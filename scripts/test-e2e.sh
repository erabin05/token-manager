#!/bin/bash

# Script de test e2e intelligent qui détecte automatiquement l'environnement
set -e

BASE_URL="http://localhost:3000"

echo "🧪 Lancement des tests e2e intelligents..."

# Fonction pour détecter l'environnement actuel
detect_current_env() {
    local current_env=""

    if docker ps --format "table {{.Names}}" | grep -q "token-manager-dev_app_1"; then
        current_env="dev"
    elif docker ps --format "table {{.Names}}" | grep -q "token-manager-prod_app_1"; then
        current_env="prod"
    fi

    echo "$current_env"
}

# Fonction pour démarrer l'environnement dev par défaut
start_dev_env() {
    echo "🚀 Aucun environnement détecté, démarrage de l'environnement dev par défaut..."
    ./scripts/switch-env.sh dev
}

# Détecter l'environnement actuel
CURRENT_ENV=$(detect_current_env)

if [ -n "$CURRENT_ENV" ]; then
    echo "🎯 Environnement détecté: ${CURRENT_ENV}"
    echo "💡 Pour switcher: npm run docker:switch:$([ "$CURRENT_ENV" = "dev" ] && echo "prod" || echo "dev")"
    
    # Vérifier que l'application répond
    if curl -f -s "${BASE_URL}/health" > /dev/null 2>&1; then
        echo "✅ L'application répond correctement sur ${BASE_URL}"
    else
        echo "⚠️  L'application ne répond pas, redémarrage de l'environnement ${CURRENT_ENV}..."
        ./scripts/switch-env.sh "$CURRENT_ENV"
    fi
else
    echo "🔍 Aucun environnement détecté"
    start_dev_env
    CURRENT_ENV="dev"
fi

echo "🚀 Lancement des tests sur l'environnement: ${CURRENT_ENV}"

# Lancer les tests avec l'environnement détecté
TEST_ENV="$CURRENT_ENV" npx playwright test "$@" 