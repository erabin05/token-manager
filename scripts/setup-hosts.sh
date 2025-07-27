#!/bin/bash

# Script pour configurer le fichier hosts pour Traefik
set -e

HOSTS_FILE="/etc/hosts"
HOSTS_ENTRIES=(
    "127.0.0.1 token-manager.server.localhost"
    "127.0.0.1 token-manager.prisma.localhost"
    "127.0.0.1 token-manager.dashboard.localhost"
)

echo "🔧 Configuration du fichier hosts pour Traefik..."

# Vérifier si les entrées existent déjà
for entry in "${HOSTS_ENTRIES[@]}"; do
    if grep -q "$entry" "$HOSTS_FILE" 2>/dev/null; then
        echo "✅ Entrée déjà présente: $entry"
    else
        echo "➕ Ajout de l'entrée: $entry"
        echo "$entry" | sudo tee -a "$HOSTS_FILE" > /dev/null
    fi
done

echo "✅ Configuration du fichier hosts terminée"
echo ""
echo "📋 Entrées ajoutées:"
for entry in "${HOSTS_ENTRIES[@]}"; do
    echo "   $entry"
done
echo ""
echo "🌐 Vous pouvez maintenant accéder à:"
echo "   - Application: http://token-manager.server.localhost"
echo "   - Prisma Studio: http://token-manager.prisma.localhost"
echo "   - Dashboard: http://token-manager.dashboard.localhost" 