#!/bin/bash

# Script de test e2e intelligent qui détecte automatiquement l'environnement
set -e

# URLs pour les différents environnements
DEV_URL="http://token-manager.server.localhost"
PROD_URL="http://localhost:3000"

echo "🧪 Lancement des tests e2e intelligents..."

# Fonction pour détecter l'environnement actuel
detect_current_env() {
    local current_env=""

    if docker ps --format "table {{.Names}}" | grep -q "token-manager-dev_server_1"; then
        current_env="dev"
    elif docker ps --format "table {{.Names}}" | grep -q "token-manager-prod_server_1"; then
        current_env="prod"
    fi

    echo "$current_env"
}

# Fonction pour obtenir l'URL de base selon l'environnement
get_base_url() {
    local env=$1
    if [ "$env" = "dev" ]; then
        echo "$DEV_URL"
    else
        echo "$PROD_URL"
    fi
}

# Fonction pour vérifier si l'application répond
check_app_health() {
    local url=$1
    local max_attempts=${2:-30}
    local delay=${3:-2}
    
    echo "🔍 Vérification de la santé de l'application sur ${url}..."
    
    for i in $(seq 1 $max_attempts); do
        if curl -f -s "${url}/health" > /dev/null 2>&1; then
            echo "✅ L'application répond correctement sur ${url}"
            return 0
        fi
        echo "   Tentative ${i}/${max_attempts}..."
        sleep $delay
    done
    
    echo "❌ L'application ne répond pas sur ${url}"
    return 1
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
    
    # Obtenir l'URL de base pour cet environnement
    BASE_URL=$(get_base_url "$CURRENT_ENV")
    
    # Vérifier que l'application répond
    if check_app_health "$BASE_URL" 5 1; then
        echo "✅ L'application répond correctement sur ${BASE_URL}"
    else
        echo "⚠️  L'application ne répond pas, redémarrage de l'environnement ${CURRENT_ENV}..."
        ./scripts/switch-env.sh "$CURRENT_ENV"
        
        # Vérifier à nouveau après redémarrage
        BASE_URL=$(get_base_url "$CURRENT_ENV")
        if ! check_app_health "$BASE_URL"; then
            echo "❌ Impossible de démarrer l'application"
            exit 1
        fi
    fi
else
    echo "🔍 Aucun environnement détecté"
    start_dev_env
    CURRENT_ENV="dev"
    BASE_URL=$(get_base_url "$CURRENT_ENV")
    
    # Vérifier que l'application répond après démarrage
    if ! check_app_health "$BASE_URL"; then
        echo "❌ Impossible de démarrer l'application"
        exit 1
    fi
fi

echo "🚀 Lancement des tests sur l'environnement: ${CURRENT_ENV} (${BASE_URL})"

# Lancer les tests avec l'environnement détecté
TEST_ENV="$CURRENT_ENV" BASE_URL="$BASE_URL" npx playwright test "$@" 