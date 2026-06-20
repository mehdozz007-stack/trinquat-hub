#!/bin/bash
# 🚀 Quick Start - Trinquat Newsletter Admin

echo "🎯 Démarrage du système Newsletter..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
  echo ""
fi

# Initialize database
if [ ! -f "trinquat_newsletter.sqlite3" ]; then
  echo "🗄️ Création de la base de données..."
  npm run db:init
  echo ""
fi

# Show available commands
echo "✅ Système prêt !"
echo ""
echo "📋 Commandes disponibles:"
echo ""
echo "  Frontend seulement:"
echo "    npm run dev              # http://localhost:5173"
echo ""
echo "  Backend seulement:"
echo "    npm run dev:server       # http://localhost:3001"
echo ""
echo "  Frontend + Backend (recommandé):"
echo "    npm run dev:all"
echo ""
echo "  Tester l'API:"
echo "    curl http://localhost:3001/api/admin/me -b cookies.txt"
echo ""
echo "  Vérifier la BD:"
echo "    npx wrangler d1 execute trinquat_newsletter --local --command \"SELECT COUNT(*) FROM newsletter_drafts;\""
echo ""
echo "🔗 URL Admin Newsletter:"
echo "    http://localhost:5173/admin/newsletter"
echo ""
echo "📝 Bootstrap Token:"
echo "    ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c"
echo ""
echo "👤 Admin par défaut:"
echo "    Email: contact@trinquatetcompagnie.fr"
echo "    Password: poiuytreza4U!"
echo ""
