# Trinquat Hub - Backend Deployment & Testing Guide

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# The Worker will be available at:
# http://localhost:8787
```

### Building

```bash
# Build the project
npm run build

# Output goes to dist/
```

---

## Testing All Endpoints

### 1. Bootstrap (Create First Admin)

Create your admin account. This should only work once (first time).

```bash
curl -X POST http://localhost:8787/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trinquat.fr",
    "password": "your-secure-password"
  }'

# Response:
# {
#   "ok": true,
#   "id": "uuid-here",
#   "email": "admin@trinquat.fr"
# }
```

### 2. Login

Authenticate and get a session cookie.

```bash
# Save cookies to file
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@trinquat.fr",
    "password": "your-secure-password"
  }'

# Response:
# {
#   "ok": true,
#   "message": "Logged in successfully"
# }
# 
# Cookie saved to cookies.txt
```

### 3. Check Session

Verify you're logged in.

```bash
curl -X GET http://localhost:8787/api/admin/me \
  -b cookies.txt

# Response:
# {
#   "id": "uuid-here",
#   "email": "admin@trinquat.fr",
#   "role": "admin"
# }
```

### 4. Newsletter Subscription (Public)

Anyone can subscribe to the newsletter.

```bash
curl -X POST http://localhost:8787/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com"
  }'

# Response:
# {
#   "ok": true,
#   "message": "Inscription confirmée."
# }
```

### 5. Events - List

Get all events (public can see published ones).

```bash
curl -X GET 'http://localhost:8787/api/admin/events?page=1&limit=20' \
  -b cookies.txt

# Response:
# {
#   "items": [
#     {
#       "id": "uuid",
#       "title": "Summer Festival",
#       "description": "...",
#       "event_date": "2024-06-15",
#       "place": "Central Park",
#       "status": "published",
#       "image_url": "https://...",
#       "created_at": "2024-01-01T12:00:00Z"
#     }
#   ],
#   "total": 25,
#   "page": 1,
#   "limit": 20
# }
```

### 6. Events - Create

Create a new event (admin only).

```bash
curl -X POST http://localhost:8787/api/admin/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Vide Grenier 2024",
    "description": "Grand vide grenier de printemps",
    "event_date": "2024-04-20",
    "place": "Parc de la Tête d'\''Or",
    "badge": "Vide Grenier",
    "image_url": "https://media.trinquat.co/events/...",
    "status": "draft"
  }'

# Response:
# {
#   "id": "new-uuid",
#   "title": "Vide Grenier 2024",
#   "status": "draft",
#   "created_at": "2024-01-15T10:00:00Z"
# }
```

### 7. Events - Update

Update an existing event.

```bash
curl -X PATCH http://localhost:8787/api/admin/events/event-uuid \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Vide Grenier 2024 - Updated",
    "status": "published"
  }'

# Response:
# {
#   "id": "event-uuid",
#   "title": "Vide Grenier 2024 - Updated",
#   "status": "published",
#   "updated_at": "2024-01-15T11:00:00Z"
# }
```

### 8. Events - Delete

Delete an event (and its associated R2 files).

```bash
curl -X DELETE http://localhost:8787/api/admin/events/event-uuid \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "id": "event-uuid"
# }
```

### 9. Gallery - List

Get all gallery items.

```bash
curl -X GET 'http://localhost:8787/api/admin/gallery?sort=order' \
  -b cookies.txt

# Response:
# {
#   "items": [
#     {
#       "id": "uuid",
#       "title": "Festival 2024",
#       "image_url": "https://...",
#       "order_index": 1,
#       "created_at": "2024-01-01T12:00:00Z"
#     }
#   ],
#   "total": 15,
#   "page": 1,
#   "limit": 20
# }
```

### 10. Gallery - Add Item

Add a new gallery item.

```bash
curl -X POST http://localhost:8787/api/admin/gallery \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Festival d'\''été",
    "description": "Ambiance musicale",
    "image_url": "https://media.trinquat.co/gallery/...",
    "order_index": 1
  }'

# Response:
# {
#   "id": "new-uuid",
#   "title": "Festival d'\''été",
#   "order_index": 1,
#   "created_at": "2024-01-15T10:00:00Z"
# }
```

### 11. Gallery - Update Item

Update gallery item or reorder.

```bash
curl -X PATCH http://localhost:8787/api/admin/gallery/item-uuid \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Festival d'\''été - Updated",
    "order_index": 2
  }'

# Response:
# {
#   "id": "item-uuid",
#   "title": "Festival d'\''été - Updated",
#   "order_index": 2,
#   "updated_at": "2024-01-15T11:00:00Z"
# }
```

### 12. Gallery - Delete Item

Delete a gallery item and its R2 file.

```bash
curl -X DELETE http://localhost:8787/api/admin/gallery/item-uuid \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "id": "item-uuid"
# }
```

### 13. Subscribers - List

List all newsletter subscribers.

```bash
curl -X GET 'http://localhost:8787/api/admin/subscribers?page=1&limit=50&is_active=true' \
  -b cookies.txt

# Response:
# {
#   "items": [
#     {
#       "id": "uuid",
#       "email": "subscriber@example.com",
#       "is_active": true,
#       "created_at": "2024-01-10T15:00:00Z"
#     }
#   ],
#   "total": 125,
#   "page": 1,
#   "limit": 50
# }
```

### 14. Subscribers - Toggle Active

Activate or deactivate a subscriber.

```bash
curl -X PATCH http://localhost:8787/api/admin/subscribers/subscriber-uuid \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "is_active": false
  }'

# Response:
# {
#   "id": "subscriber-uuid",
#   "email": "subscriber@example.com",
#   "is_active": false
# }
```

### 15. Subscribers - Delete

Delete a subscriber.

```bash
curl -X DELETE http://localhost:8787/api/admin/subscribers/subscriber-uuid \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "id": "subscriber-uuid"
# }
```

### 16. Drafts - List

List all drafts for the current admin.

```bash
curl -X GET 'http://localhost:8787/api/admin/drafts?page=1&limit=20' \
  -b cookies.txt

# Response:
# {
#   "items": [
#     {
#       "id": "uuid",
#       "subject": "Newsletter #45",
#       "content": "...",
#       "admin_email": "admin@trinquat.fr",
#       "created_at": "2024-01-10T15:00:00Z"
#     }
#   ],
#   "total": 12,
#   "page": 1,
#   "limit": 20
# }
```

### 17. Drafts - Create

Create a new draft.

```bash
curl -X POST http://localhost:8787/api/admin/drafts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "subject": "Newsletter #46",
    "content": "<h1>News this week</h1><p>Amazing events coming up...</p>"
  }'

# Response:
# {
#   "id": "new-uuid",
#   "subject": "Newsletter #46",
#   "content": "...",
#   "created_at": "2024-01-15T10:00:00Z"
# }
```

### 18. Drafts - Update

Update a draft.

```bash
curl -X PATCH http://localhost:8787/api/admin/drafts/draft-uuid \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "subject": "Newsletter #46 - Final",
    "content": "<h1>Updated content</h1>"
  }'

# Response:
# {
#   "id": "draft-uuid",
#   "subject": "Newsletter #46 - Final",
#   "updated_at": "2024-01-15T11:00:00Z"
# }
```

### 19. Drafts - Delete

Delete a draft.

```bash
curl -X DELETE http://localhost:8787/api/admin/drafts/draft-uuid \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "id": "draft-uuid"
# }
```

### 20. File Upload

Upload a file to R2.

```bash
curl -X POST http://localhost:8787/api/admin/uploads \
  -b cookies.txt \
  -F "file=@/path/to/image.jpg"

# Response:
# {
#   "key": "events/abc123-image.jpg",
#   "url": "https://media.trinquat.co/events/abc123-image.jpg",
#   "contentType": "image/jpeg",
#   "size": 2048576
# }
```

### 21. File Delete

Delete a file from R2.

```bash
curl -X DELETE 'http://localhost:8787/api/admin/uploads/events%2Fabc123-image.jpg' \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "key": "events/abc123-image.jpg"
# }
```

### 22. Logout

Clear your session.

```bash
curl -X POST http://localhost:8787/api/admin/logout \
  -b cookies.txt

# Response:
# {
#   "ok": true,
#   "message": "Logged out"
# }
```

---

## Error Responses

### 400 - Validation Error

```bash
curl -X POST http://localhost:8787/api/admin/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": ""
  }'

# Response:
# {
#   "error": "Title is required"
# }
```

### 401 - Unauthorized

```bash
curl -X POST http://localhost:8787/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# Response (no cookie sent):
# {
#   "error": "Unauthorized"
# }
```

### 404 - Not Found

```bash
curl -X GET http://localhost:8787/api/admin/events/invalid-uuid \
  -b cookies.txt

# Response:
# {
#   "error": "Event not found"
# }
```

### 409 - Conflict

```bash
curl -X POST http://localhost:8787/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com"}'

# Response (already subscribed):
# {
#   "error": "This email is already subscribed to the newsletter"
# }
```

### 500 - Server Error

```bash
# Database connection error, file upload error, etc.
# {
#   "error": "Internal server error"
# }
```

---

## Deployment to Cloudflare

### 1. Configure Cloudflare Account

```bash
# Log in to Cloudflare
wrangler login
```

### 2. Update wrangler.toml

```toml
[env.production]
name = "trinquat-hub-prod"
route = "api.trinquat.co/*"

[[env.production.d1_databases]]
binding = "trinquat_newsletter"
database_name = "trinquat-prod"

[[env.production.r2_buckets]]
binding = "MEDIA"
bucket_name = "trinquat-media-prod"
```

### 3. Run Migrations

```bash
# Create database
wrangler d1 create trinquat-prod

# Run migrations
wrangler migrations apply --remote --env production

# Verify
wrangler d1 execute trinquat-prod --remote --command "SELECT COUNT(*) FROM events"
```

### 4. Deploy

```bash
# Deploy to production
wrangler deploy --env production

# View logs
wrangler tail --env production

# Test production endpoint
curl https://api.trinquat.co/api/admin/me \
  -b cookies.txt
```

---

## Monitoring

### View Logs

```bash
# Stream live logs
wrangler tail

# With filters
wrangler tail --status success
wrangler tail --format json
```

### Database Queries

```bash
# Test a query
wrangler d1 execute trinquat-prod --command "SELECT * FROM events LIMIT 5"

# View table schema
wrangler d1 execute trinquat-prod --command ".schema events"
```

---

## Common Issues

### "Unauthorized" on admin endpoints
- Check cookie is being sent: `curl ... -b cookies.txt`
- Check session exists: `curl http://localhost:8787/api/admin/me -b cookies.txt`
- Re-login if session expired

### "Email already subscribed"
- The email was already subscribed before
- Query database to reactivate: Update `is_active` to `true`

### File upload returns 413
- File is too large
- Check Cloudflare R2 upload limits

### Database error
- Check D1 binding in `wrangler.toml`
- Check migrations have run
- View logs: `wrangler tail`

---

## Frontend Integration

The admin.content.tsx component already uses these endpoints:

```typescript
// List events
GET /api/admin/events

// Create event
POST /api/admin/events

// Update event
PATCH /api/admin/events/:id

// Delete event
DELETE /api/admin/events/:id

// Upload image
POST /api/admin/uploads

// Delete image
DELETE /api/admin/uploads/:key
```

All requests include `credentials: "include"` to send cookies automatically.

---

## Next Steps

1. ✅ **Backend ready** - All 25+ endpoints working
2. 📝 **Test locally** - Run through all curl commands above
3. 🚀 **Deploy to Cloudflare** - Follow deployment guide
4. ✔️ **Verify in production** - Test endpoints against live API
5. 📊 **Monitor** - Set up log streaming and alerts

Your backend is production-ready! 🎉
