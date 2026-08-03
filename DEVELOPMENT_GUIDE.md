# Development Guide - Contributing to Trinquat Hub Backend

## Overview

The backend follows a **layered architecture** for maximum maintainability. Each layer has a single responsibility, making it easy to understand, test, and modify the system.

---

## Adding a New Feature

Let's say you want to add a **Newsletter Analytics** endpoint that tracks open rates.

### Step 1: Define Types

Create types in `functions/types/newsletter.ts`:

```typescript
export interface NewsletterAnalytics {
  id: string;
  newsletter_id: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  created_at: string;
}

export interface CreateAnalyticsRequest {
  newsletter_id: string;
  open_count: number;
  click_count: number;
}
```

### Step 2: Create Validator

In `functions/validators/newsletterValidator.ts`:

```typescript
export class NewsletterValidator {
  static validateAnalyticsCreate(data: any): CreateAnalyticsRequest {
    if (!data.newsletter_id) {
      throw new ValidationError("Newsletter ID is required");
    }
    
    if (typeof data.open_count !== "number" || data.open_count < 0) {
      throw new ValidationError("Open count must be a non-negative number");
    }
    
    if (typeof data.click_count !== "number" || data.click_count < 0) {
      throw new ValidationError("Click count must be a non-negative number");
    }
    
    return {
      newsletter_id: data.newsletter_id,
      open_count: data.open_count,
      click_count: data.click_count,
    };
  }
}
```

### Step 3: Create Repository

In `functions/repositories/newsletterRepository.ts`:

```typescript
import { D1Database } from "@cloudflare/workers-types";
import { NewsletterAnalytics } from "../types/newsletter";

export class NewsletterRepository {
  constructor(private db: D1Database) {}

  async getAnalytics(newsletterId: string): Promise<NewsletterAnalytics | null> {
    const result = await this.db
      .prepare("SELECT * FROM newsletter_analytics WHERE newsletter_id = ?")
      .bind(newsletterId)
      .first<NewsletterAnalytics>();

    return result || null;
  }

  async createAnalytics(data: any): Promise<NewsletterAnalytics> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const openRate = (data.open_count / data.sent_count) * 100;

    await this.db
      .prepare(
        `INSERT INTO newsletter_analytics 
         (id, newsletter_id, sent_count, open_count, click_count, open_rate, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.newsletter_id,
        data.sent_count || 0,
        data.open_count,
        data.click_count,
        openRate,
        now
      )
      .run();

    return {
      id,
      newsletter_id: data.newsletter_id,
      sent_count: data.sent_count || 0,
      open_count: data.open_count,
      click_count: data.click_count,
      open_rate: openRate,
      created_at: now,
    };
  }
}
```

### Step 4: Create Service

In `functions/services/newsletterService.ts`:

```typescript
import { NewsletterRepository } from "../repositories/newsletterRepository";
import { NewsletterAnalytics, CreateAnalyticsRequest } from "../types/newsletter";
import { NewsletterValidator } from "../validators/newsletterValidator";
import { AppError, ErrorCode, NotFoundError } from "../utils/errors";

export class NewsletterService {
  constructor(private repository: NewsletterRepository) {}

  async getAnalytics(newsletterId: string): Promise<NewsletterAnalytics> {
    const analytics = await this.repository.getAnalytics(newsletterId);
    if (!analytics) {
      throw new NotFoundError("Newsletter analytics not found");
    }
    return analytics;
  }

  async trackAnalytics(data: any): Promise<NewsletterAnalytics> {
    const validated = NewsletterValidator.validateAnalyticsCreate(data);
    return await this.repository.createAnalytics(validated);
  }
}
```

### Step 5: Create Handler

In `functions/handlers.ts`, add:

```typescript
export async function handleGetNewsletterAnalytics(
  request: Request,
  newsletterId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    const analytics = await services.newsletter.getAnalytics(newsletterId);
    return successResponse(analytics);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleTrackAnalytics(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const body = await getJsonBody<any>(request);
    const analytics = await services.newsletter.trackAnalytics(body);
    return successResponse(analytics, 201);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
```

### Step 6: Update Service Factory

In `functions/serviceFactory.ts`:

```typescript
import { NewsletterService } from "./services/newsletterService";
import { NewsletterRepository } from "./repositories/newsletterRepository";

export interface Services {
  // ... existing services
  newsletter: NewsletterService;
}

export function createServices(db: D1Database, r2Bucket?: R2Bucket): Services {
  return {
    // ... existing services
    newsletter: new NewsletterService(new NewsletterRepository(db)),
  };
}
```

### Step 7: Add Routes

In `functions/_worker.ts`:

```typescript
import { handleGetNewsletterAnalytics, handleTrackAnalytics } from "./handlers";

// Add in the fetch handler:

/**
 * GET /api/admin/newsletter/analytics/:id
 * Get newsletter analytics
 */
const analyticsMatch = pathname.match(/^\/api\/admin\/newsletter\/analytics\/([^/]+)$/);
if (analyticsMatch && method === "GET") {
  const response = await handleGetNewsletterAnalytics(request, analyticsMatch[1], services);
  return corsHeaders(response);
}

/**
 * POST /api/admin/newsletter/analytics
 * Track newsletter analytics
 */
if (pathname === "/api/admin/newsletter/analytics" && method === "POST") {
  const response = await handleTrackAnalytics(request, services);
  return corsHeaders(response);
}
```

### Step 8: Create Database Migration

In `migrations/0007_newsletter_analytics.sql`:

```sql
CREATE TABLE IF NOT EXISTS newsletter_analytics (
  id TEXT PRIMARY KEY,
  newsletter_id TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER NOT NULL,
  click_count INTEGER NOT NULL,
  open_rate REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (newsletter_id) REFERENCES sent_newsletters(id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_newsletter_id 
  ON newsletter_analytics(newsletter_id);
```

### Step 9: Test

```bash
# Build
npm run build

# Test endpoint
curl -X POST http://localhost:8787/api/admin/newsletter/analytics \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "newsletter_id": "uuid",
    "sent_count": 150,
    "open_count": 45,
    "click_count": 12
  }'
```

---

## Code Style Guidelines

### Naming Conventions

```typescript
// Classes: PascalCase
export class SubscriberService {}

// Functions: camelCase
export async function handleGetSubscribers() {}

// Constants: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Interfaces: PascalCase with I prefix (optional)
export interface ISubscriber {}

// Private members: _underscore prefix
private _cache: Map<string, any> = new Map();
```

### Error Handling

```typescript
// ✅ GOOD - Specific error type
if (!subscriber) {
  throw new NotFoundError("Subscriber not found");
}

// ❌ BAD - Generic error
if (!subscriber) {
  throw new Error("Not found");
}

// ✅ GOOD - Always catch and transform
try {
  return await this.repository.save(data);
} catch (err) {
  throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to save");
}
```

### Validation

```typescript
// ✅ GOOD - Validate early, fail fast
function validateEmail(email: string): void {
  if (!email) throw new ValidationError("Email is required");
  if (!email.includes("@")) throw new ValidationError("Invalid email format");
}

// ❌ BAD - Silent failures
if (!email || !email.includes("@")) {
  // Do nothing?
}
```

### Database Queries

```typescript
// ✅ GOOD - Prepared statement
const result = await db
  .prepare("SELECT * FROM users WHERE email = ?")
  .bind(email)
  .first();

// ❌ BAD - String concatenation (SQL injection!)
const result = await db
  .prepare(`SELECT * FROM users WHERE email = '${email}'`)
  .first();
```

### Response Format

```typescript
// ✅ GOOD - Consistent response shape
return successResponse({
  id: subscriber.id,
  email: subscriber.email,
  is_active: subscriber.is_active,
});

// ❌ BAD - Inconsistent format
return new Response(JSON.stringify({ subscriber }));
```

---

## Testing Strategy

### Unit Tests (Not yet implemented, but here's the pattern)

```typescript
// __tests__/subscriberService.test.ts
import { SubscriberService } from "../services/subscriberService";
import { SubscriberRepository } from "../repositories/subscriberRepository";

describe("SubscriberService", () => {
  let service: SubscriberService;
  let repository: SubscriberRepository;

  beforeEach(() => {
    repository = new MockSubscriberRepository();
    service = new SubscriberService(repository);
  });

  test("should subscribe new email", async () => {
    const result = await service.subscribe("test@example.com");
    
    expect(result.email).toBe("test@example.com");
    expect(result.is_active).toBe(true);
  });

  test("should throw error if email already subscribed", async () => {
    await service.subscribe("test@example.com");
    
    await expect(service.subscribe("test@example.com")).rejects.toThrow(
      "Email is already subscribed"
    );
  });
});
```

### Integration Tests

```bash
# 1. Bootstrap
curl -X POST http://localhost:8787/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"test@trinquat.fr","password":"test123"}'

# 2. Login
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@trinquat.fr","password":"test123"}'

# 3. Create
curl -X POST http://localhost:8787/api/admin/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test","event_date":"2024-06-15","place":"Test"}'

# 4. Verify
curl -X GET http://localhost:8787/api/admin/events \
  -b cookies.txt | jq '.items | length'
```

---

## Performance Considerations

### Database Indexing

The migrations create indexes on frequently queried columns:

```sql
-- Good - Events table indexed for common queries
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_published_at ON events(published_at);
CREATE INDEX idx_events_event_date ON events(event_date);

-- Add index if you add new frequently-filtered field
CREATE INDEX idx_table_field ON table(field);
```

### Pagination

Always paginate list endpoints:

```typescript
// ✅ GOOD - Limited results
const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));

// ❌ BAD - Could return millions of rows
const all = await db.prepare("SELECT * FROM events").all();
```

### Connection Pooling

D1 automatically handles connection pooling - no need to manually manage.

### File Optimization

For R2 uploads, consider:

```typescript
// Keep file sizes reasonable
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Validate before uploading
if (file.size > MAX_FILE_SIZE) {
  throw new ValidationError("File too large");
}
```

---

## Debugging Tips

### Enable Request Logging

```typescript
// In _worker.ts
console.log(`${method} ${pathname}`);
console.log("Request body:", JSON.stringify(await request.json()));
```

### View Worker Logs

```bash
# Stream logs
wrangler tail

# Filter by status
wrangler tail --status error

# Export logs
wrangler tail > logs.txt
```

### Database Debugging

```bash
# View schema
wrangler d1 execute trinquat-hub --command ".schema events"

# Count records
wrangler d1 execute trinquat-hub --command "SELECT COUNT(*) as count FROM events"

# View specific record
wrangler d1 execute trinquat-hub --command "SELECT * FROM events WHERE id = 'uuid' LIMIT 1"
```

### Testing with curl

```bash
# Verbose output (shows headers)
curl -v http://localhost:8787/api/admin/me -b cookies.txt

# Pretty print JSON
curl http://localhost:8787/api/admin/events -b cookies.txt | jq

# Save response to file
curl http://localhost:8787/api/admin/events -b cookies.txt > response.json

# Time the request
curl -w "@curl-format.txt" http://localhost:8787/api/admin/me -b cookies.txt
```

---

## Security Checklist

- [ ] All inputs validated before database
- [ ] Prepared statements used everywhere (no string concatenation)
- [ ] Errors don't leak sensitive information
- [ ] Authentication checked on all admin endpoints
- [ ] CORS headers properly configured
- [ ] HttpOnly cookies for session storage
- [ ] File uploads validated (size, type)
- [ ] Database backups configured (Cloudflare)
- [ ] Logs monitored for suspicious activity
- [ ] Rate limiting considered for public endpoints

---

## Common Pitfalls

### ❌ Forgetting to validate input

```typescript
// BAD - Could crash or corrupt data
async create(data: any) {
  await this.db.prepare("INSERT INTO ...").bind(data.email).run();
}

// GOOD - Validate first
async create(data: any) {
  const validated = SubscriberValidator.validateCreate(data);
  await this.db.prepare("INSERT INTO ...").bind(validated.email).run();
}
```

### ❌ Not handling errors in handlers

```typescript
// BAD - Unhandled error will crash
export async function handleCreate(request, services) {
  const result = await services.event.create(data);
  return successResponse(result);
}

// GOOD - Wrap in try-catch
export async function handleCreate(request, services) {
  try {
    const result = await services.event.create(data);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
```

### ❌ Mixing business logic with database queries

```typescript
// BAD - Service has SQL
async create(data) {
  const result = await this.db.prepare("INSERT ...").run();
  return result;
}

// GOOD - Service calls repository
async create(data) {
  const validated = validate(data);
  return await this.repository.create(validated);
}
```

### ❌ Not checking async/await

```typescript
// BAD - Will return Promise, not data
export async function handleGetEvents(request, services) {
  const events = services.event.getAll(); // Missing await!
  return successResponse(events);
}

// GOOD - Use await
export async function handleGetEvents(request, services) {
  const events = await services.event.getAll();
  return successResponse(events);
}
```

---

## Summary

The codebase is designed with these principles:

1. **Single Responsibility** - Each class/function does one thing
2. **Dependency Injection** - Services are passed their dependencies
3. **Error Handling** - Errors are caught, transformed, and responded to
4. **Type Safety** - Full TypeScript throughout
5. **Security** - Input validation, prepared statements, secure cookies
6. **Testability** - Each layer can be tested independently
7. **Maintainability** - Clear structure makes changes easy

Follow this guide when adding features and the codebase will remain clean and professional! 🚀
