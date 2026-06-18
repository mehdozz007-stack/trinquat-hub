# Backend Setup Guide

## Quick Start (Both Frontend + Backend)

```bash
npm install  # Install dependencies if not done
npm run dev:all
```

This will run both:
- **Frontend**: Vite on http://localhost:5173 (React UI)
- **Backend**: Express server on http://localhost:3001 (API endpoints)

## Manual Setup (Separate Terminals)

### Terminal 1 - Frontend
```bash
npm run dev
```
Starts Vite dev server on http://localhost:5173

### Terminal 2 - Backend
```bash
npm run dev:server
```
Starts Express server on http://localhost:3001

## API Endpoints

### Admin Authentication

**Bootstrap (Create first admin)**
```bash
curl -X POST http://localhost:3001/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c" \
  -d '{
    "email": "contact@trinquatetcompagnie.fr",
    "password": "YourSecurePassword"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }' \
  -c cookies.txt
```

**Get Current Session**
```bash
curl http://localhost:3001/api/admin/me -b cookies.txt
```

**Logout**
```bash
curl -X POST http://localhost:3001/api/admin/logout -b cookies.txt
```

### Newsletter

**Subscribe**
```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**List Subscribers (Admin only)**
```bash
curl http://localhost:3001/api/admin/subscribers \
  -b cookies.txt
```

**Toggle Subscriber Active Status**
```bash
curl -X PATCH http://localhost:3001/api/admin/subscribers/{id} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"is_active": false}'
```

**Delete Subscriber**
```bash
curl -X DELETE http://localhost:3001/api/admin/subscribers/{id} \
  -b cookies.txt
```

**Export CSV**
```bash
curl http://localhost:3001/api/admin/subscribers/export \
  -b cookies.txt \
  -o newsletter.csv
```

## Features

✅ **Admin Authentication**
- Bootstrap first admin with special token
- Login/logout with session cookies
- Session persistence

✅ **Newsletter Management**
- Subscribe new emails
- Admin list/search subscribers
- Toggle active status
- Delete subscribers
- Export as CSV

## Data Storage

- **In-Memory**: Data is stored in memory (resets on server restart)
- **Production**: Will be replaced with Cloudflare D1 database

## Credentials

### Bootstrap Token
```
ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c
```

## Troubleshooting

### "Cannot connect to localhost:3001"
- Make sure backend is running: `npm run dev:server`
- Check that port 3001 is not in use

### CORS errors
- CORS is enabled on backend for `http://localhost:5173`
- Make sure both servers are running

### Session lost
- Sessions are in-memory only
- Data resets when server restarts

## Next Steps

1. Bootstrap your first admin account
2. Login via http://localhost:5173/admin/login
3. Manage newsletter subscribers
4. Test public subscription form

## Future: Database Integration

When ready to persist data:
1. Connect to Cloudflare D1 database
2. Replace in-memory arrays with database queries
3. Deploy via Cloudflare Workers
