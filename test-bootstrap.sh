#!/bin/bash

BOOTSTRAP_TOKEN="ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c"
EMAIL="contact@trinquatetcompagnie.fr"
PASSWORD="poiuytreza4U!"

echo "🔷 Step 1: Bootstrap admin..."
curl -s -X POST http://localhost:3001/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: $BOOTSTRAP_TOKEN" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq '.'

sleep 1

echo ""
echo "🔷 Step 2: Login..."
curl -s -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq '.'

sleep 1

echo ""
echo "🔷 Step 3: Save draft..."
curl -s -X POST http://localhost:3001/api/admin/drafts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"subject":"Test Newsletter","content":"This is a test"}' | jq '.'

echo ""
echo "🔷 Step 4: Get drafts..."
curl -s -X GET http://localhost:3001/api/admin/drafts \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
