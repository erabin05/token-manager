#!/bin/bash

# Script pour restaurer la base de données
set -e

echo "🔄 Restauration de la base de données..."

# Vérifier que l'application répond
if ! curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
    echo "❌ L'application ne répond pas sur http://localhost:3000"
    echo "💡 Assurez-vous que votre serveur est démarré avec: npm run dev"
    exit 1
fi

echo "✅ Application accessible sur http://localhost:3000"
echo ""

# Fonction pour afficher l'état de la base de données
show_db_status() {
    echo "📊 État de la base de données:"
    
    # Compter les utilisateurs
    USER_COUNT=$(curl -s -H "x-user-id: 1" http://localhost:3000/users | jq 'length' 2>/dev/null || echo "0")
    echo "   👥 Utilisateurs: $USER_COUNT"
    
    # Compter les thèmes
    THEME_COUNT=$(curl -s -H "x-user-id: 1" http://localhost:3000/themes | jq 'length' 2>/dev/null || echo "0")
    echo "   🎨 Thèmes: $THEME_COUNT"
    
    # Compter les tokens
    TOKEN_COUNT=$(curl -s -H "x-user-id: 1" http://localhost:3000/tokens | jq 'length' 2>/dev/null || echo "0")
    echo "   🏷️  Tokens: $TOKEN_COUNT"
    
    # Compter les groupes
    GROUP_COUNT=$(curl -s -H "x-user-id: 1" http://localhost:3000/groups | jq 'length' 2>/dev/null || echo "0")
    echo "   📁 Groupes: $GROUP_COUNT"
    echo ""
}

echo "📋 État initial:"
show_db_status

# Confirmation de l'utilisateur
echo "⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes et les remplacer par les données de test."
read -p "🤔 Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 0
fi

echo "🧹 Nettoyage de la base de données..."
echo ""

# Exécuter le seed via l'API (le seed.ts nettoie automatiquement la base)
echo "🌱 Exécution du seed..."
npx ts-node prisma/seed.ts

if [ $? -eq 0 ]; then
    echo "✅ Seed exécuté avec succès!"
else
    echo "❌ Erreur lors de l'exécution du seed"
    exit 1
fi

echo ""
echo "📋 État final:"
show_db_status

echo "🎯 Restauration terminée avec succès!"
echo ""
echo "📋 Données créées:"
echo "   👥 4 utilisateurs (viewer, maintainer, admin, alice)"
echo "   🎨 2 thèmes (light, dark)"
echo "   🏷️ 4 tokens (primary-color, border-radius, font-size, spacing)"
echo "   📁 3 groupes (Colors, Sizes, Borders)"
echo ""
echo "💡 Vous pouvez maintenant utiliser test-api.http avec les IDs suivants:"
echo "   @viewerUserId = 1 (viewer@example.com)"
echo "   @maintainerUserId = 2 (maintainer@example.com)"
echo "   @adminUserId = 3 (admin@example.com)" 