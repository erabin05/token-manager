#!/bin/bash

# Script pour vérifier l'état des environnements Docker
set -e

echo "🔍 Vérification des environnements Docker..."

# Fonction pour vérifier un environnement
check_env() {
  local env=$1
  local project_name="token-manager-${env}"
  local compose_file="docker-compose.${env}.yml"
  
  echo "📋 Environnement: ${env}"
  
  # Vérifier si les conteneurs sont en cours d'exécution
  if docker ps --format "table {{.Names}}" | grep -q "${project_name}_server_1"; then
    echo "   ✅ Application: En cours d'exécution"
    
    # Vérifier si l'application répond
    if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
      echo "   ✅ Santé: OK"
    else
      echo "   ⚠️  Santé: Ne répond pas"
    fi
  else
    echo "   ❌ Application: Arrêtée"
  fi
  
  if docker ps --format "table {{.Names}}" | grep -q "${project_name}_db_1"; then
    echo "   ✅ Base de données: En cours d'exécution"
  else
    echo "   ❌ Base de données: Arrêtée"
  fi
  
  echo ""
}

# Vérifier les deux environnements
check_env "dev"
check_env "prod"

# Résumé
echo "📊 Résumé:"
echo "   Pour démarrer un environnement: npm run docker:dev ou npm run docker:prod"
echo "   Pour tester: npm run test:e2e:dev ou npm run test:e2e:prod"
echo "   Pour nettoyer: npm run docker:dev:down ou npm run docker:prod:down" 