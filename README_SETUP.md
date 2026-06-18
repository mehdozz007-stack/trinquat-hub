# 🚀 Trinquat Hub - Setup Guide

## Current Architecture

**Client-side only React app** with mock authentication for the admin panel.

```
Frontend: React 19 + TanStack Router + Tailwind CSS
Server: None (currently using localStorage + mock data)
Database: None (mock data for development)
```

## Quick Start (30 seconds)

### 1. Start the dev server

```bash
npm run dev
```

Opens on **http://localhost:5173**

### 2. Admin Login

Navigate to: **http://localhost:5173/admin/login**

**Credentials:**
- Email: `admin@trinquat.local`
- Password: `Pass123!`

### 3. Try the features

- ✅ Newsletter subscription (public page)
- ✅ Admin dashboard (list, search, toggle, delete, export)
- ✅ Mock data (6 subscribers pre-loaded)

## Build for Production

```bash
npm run build
npm run preview
```

## Directory Structure

```
src/
├── routes/              # Page routes (React Router)
│   ├── index.tsx        # Home page
│   ├── admin.login.tsx  # Admin login (mock auth)
│   ├── admin.newsletter.tsx  # Admin dashboard (mock data)
│   └── [other pages]
├── components/
│   ├── site/            # Public site components
│   ├── ui/              # Shadcn UI components
│   └── ...
├── styles/              # Tailwind CSS
├── lib/                 # Utilities
└── server/              # (Server utilities - see below)
```

## Server-Side Files (For Future Backend)

These files are prepared for a future backend implementation:

- `src/server/auth.server.ts` - JWT + bcrypt helpers
- `src/server/db.server.ts` - D1 database access
- `src/server/validation.server.ts` - Zod validation schemas
- `migrations/0001_init.sql` - D1 database schema
- `wrangler.toml` - Cloudflare Workers config
- `.env.local` - JWT secrets (generated)

**Current Status:** These are NOT used (client-only app for now).

## Future: Adding a Real Backend

### Option 1: Node.js Express Server (Recommended for local dev)

```bash
npm install express cors
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Add API routes here
app.post('/api/admin/login', (req, res) => {
  // Implement JWT auth
});

app.listen(3001);
```

Then update `src/routes/admin.login.tsx` to call `http://localhost:3001/api/admin/login` instead of using mock data.

### Option 2: Cloudflare Workers + D1 (For production)

We have everything prepared:

```bash
# 1. Create D1 database
wrangler d1 create trinquat_newsletter

# 2. Get database ID, update wrangler.toml

# 3. Set secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put ADMIN_BOOTSTRAP_TOKEN --env production

# 4. Deploy
npm run build && wrangler deploy --env production
```

The API routes will be in `src/server/routes/api/` using Nitro.

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/admin.login.tsx` | Admin login page (mock auth) |
| `src/routes/admin.newsletter.tsx` | Admin dashboard (mock data) |
| `src/components/site/Newsletter.tsx` | Newsletter subscription form |
| `src/server/auth.server.ts` | JWT + bcrypt (prepared) |
| `wrangler.toml` | Cloudflare config (prepared) |
| `.env.local` | JWT secrets (in .gitignore) |

## Credentials (Development)

For admin login:
- **Email:** `admin@trinquat.local`
- **Password:** `Pass123!`

These are hardcoded in `src/routes/admin.login.tsx` (mock data).

## Environment Variables

`.env.local` contains:
```env
JWT_SECRET=71778026d38678c7f8bb082d7e82b36b2571572dc22944798a52410aa1542826
ADMIN_BOOTSTRAP_TOKEN=ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c
```

These are for **future use** with a real backend. Currently, the app doesn't read these.

## Tech Stack

- **React 19** - UI framework
- **TanStack Router** - Client-side routing  
- **Tailwind CSS 4** - Styling
- **Shadcn/ui** - Component library
- **Vite 7** - Build tool
- **TypeScript** - Type safety

## Troubleshooting

### "Admin login doesn't work"
→ Make sure you're using exact credentials: `admin@trinquat.local` / `Pass123!`

### "Subscribers list is empty"
→ It's mock data. Edit `src/routes/admin.newsletter.tsx` to modify `MOCK_SUBSCRIBERS`.

### "Can't build"
→ Run `npm install` to ensure all dependencies are installed.

## Next Steps

1. **Add real database:** Either use Express + SQLite locally, or set up Cloudflare D1
2. **Implement actual auth:** Replace mock login with real JWT validation
3. **Add email sending:** Integrate Resend or SendGrid for newsletters
4. **Deploy:** Use Vercel (client) + Cloudflare Workers (server)

---

For detailed backend setup, see the server files in `src/server/`.
