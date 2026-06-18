#!/bin/bash
# bootstrap-admin.sh - Crée le premier admin pour développement local

ENDPOINT="http://localhost:8787"
BOOTSTRAP_TOKEN="ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "📝 Bootstrap Admin - Trinquat Hub"
echo "=================================="
echo ""

# Vérifier que le serveur est en marche
echo "🔍 Vérification du serveur..."
if ! curl -s "$ENDPOINT" > /dev/null; then
    echo -e "${RED}❌ Le serveur n'est pas accessible sur $ENDPOINT${NC}"
    echo "   Lancez d'abord: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Serveur accessible${NC}"
echo ""

# Demander email et password
read -p "📧 Email admin: " EMAIL
read -sp "🔑 Mot de passe: " PASSWORD
echo ""

# Faire la requête
echo ""
echo "⏳ Création du premier admin..."

RESPONSE=$(curl -s -X POST "$ENDPOINT/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: $BOOTSTRAP_TOKEN" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Vérifier la réponse
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Admin créé avec succès!${NC}"
    echo ""
    echo "🎉 Vous pouvez maintenant vous connecter:"
    echo "   URL: $ENDPOINT/admin/login"
    echo "   Email: $EMAIL"
    echo "   Mot de passe: (celui que vous avez entré)"
else
    echo -e "${RED}❌ Erreur lors de la création:${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi
