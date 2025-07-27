#!/bin/bash

# Script de diagnostic pour identifier les problèmes d'environnement
set -e

echo "🔍 Diagnostic de l'environnement Token Manager..."
echo ""

# Vérifier Docker
echo "🐳 Vérification de Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker installé"
    if docker info &> /dev/null; then
        echo "✅ Docker fonctionne"
    else
        echo "❌ Docker ne fonctionne pas"
        exit 1
    fi
else
    echo "❌ Docker non installé"
    exit 1
fi

# Vérifier Docker Compose
echo ""
echo "📦 Vérification de Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose installé"
else
    echo "❌ Docker Compose non installé"
    exit 1
fi

# Vérifier les conteneurs en cours d'exécution
echo ""
echo "🚀 Vérification des conteneurs..."
DEV_RUNNING=$(docker ps --format "table {{.Names}}" | grep -c "token-manager-dev" || echo "0")
PROD_RUNNING=$(docker ps --format "table {{.Names}}" | grep -c "token-manager-prod" || echo "0")

if [ "$DEV_RUNNING" -gt 0 ]; then
    echo "🟢 Environnement DEV: $DEV_RUNNING conteneur(s) en cours"
else
    echo "🔴 Environnement DEV: Aucun conteneur en cours"
fi

if [ "$PROD_RUNNING" -gt 0 ]; then
    echo "🟢 Environnement PROD: $PROD_RUNNING conteneur(s) en cours"
else
    echo "🔴 Environnement PROD: Aucun conteneur en cours"
fi

# Vérifier les ports
echo ""
echo "🌐 Vérification des ports..."
if netstat -an 2>/dev/null | grep -q ":80 "; then
    echo "✅ Port 80 (Traefik) ouvert"
else
    echo "❌ Port 80 (Traefik) fermé"
fi

if netstat -an 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Port 3000 ouvert"
else
    echo "❌ Port 3000 fermé"
fi

# Vérifier le fichier hosts
echo ""
echo "📝 Vérification du fichier hosts..."
HOSTS_FILE="/etc/hosts"
if grep -q "token-manager.server.localhost" "$HOSTS_FILE" 2>/dev/null; then
    echo "✅ Entrée token-manager.server.localhost présente"
else
    echo "❌ Entrée token-manager.server.localhost manquante"
    echo "💡 Exécutez: npm run setup:hosts"
fi

if grep -q "token-manager.prisma.localhost" "$HOSTS_FILE" 2>/dev/null; then
    echo "✅ Entrée token-manager.prisma.localhost présente"
else
    echo "❌ Entrée token-manager.prisma.localhost manquante"
    echo "💡 Exécutez: npm run setup:hosts"
fi

# Vérifier la connectivité
echo ""
echo "🔗 Vérification de la connectivité..."

# Test direct sur localhost:3000
if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
    echo "✅ Application répond sur http://localhost:3000"
else
    echo "❌ Application ne répond pas sur http://localhost:3000"
fi

# Test via Traefik
if curl -f -s "http://token-manager.server.localhost/health" > /dev/null 2>&1; then
    echo "✅ Application répond sur http://token-manager.server.localhost"
else
    echo "❌ Application ne répond pas sur http://token-manager.server.localhost"
fi

# Vérifier les logs des conteneurs
echo ""
echo "📋 Logs des conteneurs..."
if [ "$DEV_RUNNING" -gt 0 ]; then
    echo "📊 Logs du serveur DEV:"
    docker logs --tail 5 token-manager-dev_server_1 2>/dev/null || echo "   Aucun log disponible"
    echo ""
    echo "📊 Logs de Traefik:"
    docker logs --tail 5 token-manager-dev_traefik_1 2>/dev/null || echo "   Aucun log disponible"
fi

echo ""
echo "🎯 Recommandations:"
if [ "$DEV_RUNNING" -eq 0 ] && [ "$PROD_RUNNING" -eq 0 ]; then
    echo "   🚀 Aucun environnement actif, démarrez avec: npm run docker:switch:dev"
elif [ "$DEV_RUNNING" -gt 0 ]; then
    echo "   ✅ Environnement DEV actif"
    echo "   🌐 Accédez à: http://token-manager.server.localhost"
    echo "   🗄️  Prisma Studio: http://token-manager.prisma.localhost"
elif [ "$PROD_RUNNING" -gt 0 ]; then
    echo "   ✅ Environnement PROD actif"
    echo "   🌐 Accédez à: http://localhost:3000"
fi

echo ""
echo "🔧 Commandes utiles:"
echo "   npm run setup:hosts     - Configurer le fichier hosts"
echo "   npm run docker:switch:dev  - Démarrer l'environnement DEV"
echo "   npm run docker:switch:prod - Démarrer l'environnement PROD"
echo "   npm run test:e2e        - Lancer les tests e2e"
echo "   npm run docker:dev:logs - Voir les logs DEV" 