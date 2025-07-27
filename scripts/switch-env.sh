#!/bin/bash

# Script pour switcher d'environnement Docker
set -e

# Déterminer l'environnement cible (dev par défaut)
TARGET_ENV=${1:-dev}

if [[ "$TARGET_ENV" != "dev" && "$TARGET_ENV" != "prod" ]]; then
    echo "❌ Erreur: L'environnement doit être 'dev' ou 'prod'"
    echo "Usage: $0 [dev|prod]"
    exit 1
fi

COMPOSE_FILE="docker-compose.${TARGET_ENV}.yml"
PROJECT_NAME="token-manager-${TARGET_ENV}"
BASE_URL="http://localhost:3000"

echo "🔄 Switch vers l'environnement: ${TARGET_ENV}..."

# Fonction pour afficher l'état détaillé des environnements
show_env_status() {
    echo "📊 État des environnements Docker:"
    
    # Vérifier l'environnement dev
    if docker ps --format "table {{.Names}}" | grep -q "token-manager-dev_server_1"; then
        echo "   🟢 DEV: En cours d'exécution"
        if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
            echo "      ✅ Application répond sur http://localhost:3000"
        else
            echo "      ⚠️  Application ne répond pas"
        fi
    else
        echo "   🔴 DEV: Arrêté"
    fi
    
    # Vérifier l'environnement prod
    if docker ps --format "table {{.Names}}" | grep -q "token-manager-prod_server_1"; then
        echo "   🟢 PROD: En cours d'exécution"
        if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
            echo "      ✅ Application répond sur http://localhost:3000"
        else
            echo "      ⚠️  Application ne répond pas"
        fi
    else
        echo "   🔴 PROD: Arrêté"
    fi
    echo ""
}

# Fonction pour détecter l'environnement actuel
detect_current_env() {
    if docker ps --format "table {{.Names}}" | grep -q "token-manager-dev_server_1"; then
        echo "dev"
    elif docker ps --format "table {{.Names}}" | grep -q "token-manager-prod_server_1"; then
        echo "prod"
    else
        echo ""
    fi
}

# Fonction pour arrêter tous les environnements
stop_all_envs() {
    echo "🛑 Arrêt de tous les environnements..."
    
    # Arrêter dev
    if docker ps --format "table {{.Names}}" | grep -q "token-manager-dev_server_1"; then
        echo "   🛑 Arrêt de l'environnement dev..."
        docker-compose -f docker-compose.dev.yml --project-name token-manager-dev down --volumes --remove-orphans 2>/dev/null || true
        echo "   ✅ Environnement dev arrêté"
    fi
    
    # Arrêter prod
    if docker ps --format "table {{.Names}}" | grep -q "token-manager-prod_server_1"; then
        echo "   🛑 Arrêt de l'environnement prod..."
        docker-compose -f docker-compose.prod.yml --project-name token-manager-prod down --volumes --remove-orphans 2>/dev/null || true
        echo "   ✅ Environnement prod arrêté"
    fi
    
    echo "✅ Tous les environnements arrêtés"
    echo ""
}

# Afficher l'état initial
echo "📋 État initial:"
show_env_status

# Détecter l'environnement actuel
CURRENT_ENV=$(detect_current_env)

if [ "$CURRENT_ENV" = "$TARGET_ENV" ]; then
    echo "✅ L'environnement ${TARGET_ENV} est déjà actif"
    
    # Vérifier que l'application répond
    if curl -f -s "${BASE_URL}/health" > /dev/null 2>&1; then
        echo "✅ L'application répond correctement sur ${BASE_URL}"
        echo "🎯 Aucune action nécessaire - environnement ${TARGET_ENV} déjà prêt"
        exit 0
    else
        echo "⚠️  L'application ne répond pas, redémarrage nécessaire..."
        stop_all_envs
    fi
else
    if [ -n "$CURRENT_ENV" ]; then
        echo "🔄 Changement d'environnement: ${CURRENT_ENV} → ${TARGET_ENV}"
        stop_all_envs
    else
        echo "🚀 Aucun environnement en cours, démarrage de ${TARGET_ENV}..."
    fi
fi

# Démarrer le nouvel environnement
echo "🚀 Démarrage de l'environnement ${TARGET_ENV}..."
echo "   📁 Fichier: ${COMPOSE_FILE}"
echo "   🏷️  Projet: ${PROJECT_NAME}"
echo "   🌐 URL: ${BASE_URL}"
echo ""

docker-compose -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} up --build -d

# Attendre que l'application soit prête
echo "⏳ Attente que l'application soit prête..."
for i in {1..30}; do
    if curl -f -s "${BASE_URL}/health" > /dev/null 2>&1; then
        echo "✅ L'environnement ${TARGET_ENV} est prêt sur ${BASE_URL}"
        echo ""
        echo "📋 État final:"
        show_env_status
        echo "🎯 Switch terminé avec succès vers l'environnement: ${TARGET_ENV}"
        exit 0
    fi
    echo "   Tentative ${i}/30..."
    sleep 2
done

echo "❌ L'application n'a pas démarré dans le délai imparti"
echo ""
echo "📋 État final:"
show_env_status
echo "❌ Switch échoué - l'application n'a pas démarré"
exit 1 