/**
 * Cloudflare Worker - API Routes
 * Centralized routing for all API endpoints
 * Uses Service/Repository pattern for clean separation of concerns
 */

import { createServices } from "./serviceFactory";
import {
  handleGetSubscribers,
  handleUpdateSubscriber,
  handleDeleteSubscriber,
  handleGetEvents,
  handleGetEvent,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  handleGetGallery,
  handleAddGalleryItem,
  handleUpdateGalleryItem,
  handleDeleteGalleryItem,
  handleGetDrafts,
  handleCreateDraft,
  handleUpdateDraft,
  handleDeleteDraft,
  handleUpload,
  handleDeleteUpload,
  handleGetUpcomingEvents,
  handleGetPastEvents,
  handleGetNews,
  handleGetPublicGallery,
  handleServeImage,
} from "./handlers";
import { getAdminIdFromCookie } from "./utils/auth";

interface Env {
  trinquat_newsletter: D1Database;
  RESEND_API_KEY?: string;
  JWT_SECRET?: string;
  ADMIN_BOOTSTRAP_TOKEN?: string;
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_URL?: string;
}

export type { Env };

/**
 * Add CORS headers to response
 */
function corsHeaders(response: Response, origin?: string): Response {
  const originHeader = origin || "*";
  response.headers.set("Access-Control-Allow-Origin", originHeader);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (originHeader !== "*") {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

/**
 * Parse JSON body safely
 */
async function getJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.text();
    if (!body) return null;
    return JSON.parse(body);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    console.log(`[WORKER] ${method} ${pathname} (full URL: ${request.url})`);

    // Initialize services
    const services = createServices(env.trinquat_newsletter, env.MEDIA);
    const envProxy = { MEDIA: env.MEDIA, MEDIA_PUBLIC_URL: env.MEDIA_PUBLIC_URL };

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return corsHeaders(new Response("OK", { status: 204 }));
    }

    try {
      // ============ PUBLIC ROUTES (No auth required) ============

      /**
       * POST /api/newsletter/subscribe
       * Subscribe email to newsletter
       */
      if (pathname === "/api/newsletter/subscribe" && method === "POST") {
        const body = await getJsonBody<{ email: string }>(request);
        if (!body || !body.email) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Veuillez entrer votre adresse email." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        // Validate email format
        if (!body.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Veuillez entrer une adresse email valide." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        try {
          const subscriber = await services.subscriber.subscribe(body.email);
          return corsHeaders(
            new Response(JSON.stringify({ ok: true, message: "Inscription confirmée." }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        } catch (err: any) {
          console.error("Subscribe error:", err);
          const errorMsg = String(err.message || err);
          if (errorMsg.includes("already")) {
            return corsHeaders(
              new Response(JSON.stringify({ error: "Cet email est déjà inscrit à la newsletter." }), {
                status: 409,
                headers: { "Content-Type": "application/json" },
              })
            );
          }
          return corsHeaders(
            new Response(
              JSON.stringify({ error: "Une erreur serveur s'est produite. Veuillez réessayer." }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }
      }

      /**
       * GET /api/events
       * Public endpoint for upcoming published events
       */
      if (pathname === "/api/events" && method === "GET") {
        console.log(`[ROUTES] GET /api/events`);
        const response = await handleGetUpcomingEvents(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/events/past
       * Public endpoint for past published events
       */
      if (pathname === "/api/events/past" && method === "GET") {
        console.log(`[ROUTES] GET /api/events/past`);
        const response = await handleGetPastEvents(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/news
       * Public endpoint for published news/actualités
       */
      if (pathname === "/api/news" && method === "GET") {
        console.log(`[ROUTES] GET /api/news`);
        const response = await handleGetNews(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/gallery
       * Public endpoint for gallery items
       */
      if (pathname === "/api/gallery" && method === "GET") {
        console.log(`[ROUTES] GET /api/gallery`);
        const response = await handleGetPublicGallery(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /uploads/*
       * Serve image files from R2
       */
      if (pathname.startsWith("/uploads/") && method === "GET") {
        const fileKey = pathname.slice(9); // Remove "/uploads/" prefix
        console.log(`[ROUTES] GET /uploads/${fileKey}`);
        const response = await handleServeImage(request, fileKey, envProxy);
        return corsHeaders(response);
      }

      /**
       * GET /api/admin/events
       * List all events (public can see published)
       */
      console.log(`[ROUTES] Checking events route: pathname="${pathname}" method="${method}"`);
      if (pathname === "/api/admin/events" && method === "GET") {
        console.log(`[EVENTS] Route matched! Calling handleGetEvents`);
        const response = await handleGetEvents(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/admin/gallery
       * List gallery items (public)
       */
      if (pathname === "/api/admin/gallery" && method === "GET") {
        const response = await handleGetGallery(request, services);
        return corsHeaders(response);
      }

      // ============ ADMIN ROUTES (Auth required) ============

      /**
       * POST /api/admin/bootstrap
       * Create first admin user
       */
      if (pathname === "/api/admin/bootstrap" && method === "POST") {
        const body = await getJsonBody<{ email: string; password: string; token?: string }>(request);
        if (!body || !body.email || !body.password) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Email and password required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const adminId = crypto.randomUUID();
          const now = new Date().toISOString();

          await db
            .prepare(
              `INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(adminId, body.email, body.password, "admin", now, now)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: adminId, email: body.email }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        } catch (err: any) {
          console.error("Bootstrap error:", err);
          return corsHeaders(
            new Response(JSON.stringify({ error: "Bootstrap failed" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      }

      /**
       * POST /api/admin/login
       * Authenticate admin and set cookie
       */
      if (pathname === "/api/admin/login" && method === "POST") {
        const body = await getJsonBody<{ email: string; password: string }>(request);
        if (!body || !body.email || !body.password) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Email and password required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare("SELECT id, email, password_hash FROM admins WHERE email = ?")
            .bind(body.email)
            .first<{ id: string; email: string; password_hash: string }>();

          if (!result) {
            return corsHeaders(
              new Response(JSON.stringify({ error: "Invalid credentials" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              })
            );
          }

          // Simple password comparison (should use bcrypt in production)
          const passwordMatch = body.password === result.password_hash;
          if (!passwordMatch) {
            return corsHeaders(
              new Response(JSON.stringify({ error: "Invalid credentials" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              })
            );
          }

          const response = new Response(JSON.stringify({ ok: true, message: "Logged in successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
          response.headers.set(
            "Set-Cookie",
            `tc_admin=${result.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
          );
          return corsHeaders(response);
        } catch (err: any) {
          console.error("Login error:", err);
          return corsHeaders(
            new Response(JSON.stringify({ error: "Server error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      }

      /**
       * GET /api/admin/me
       * Get current admin session
       */
      if (pathname === "/api/admin/me" && method === "GET") {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare("SELECT id, email, role FROM admins WHERE id = ?")
            .bind(adminId)
            .first<{ id: string; email: string; role: string }>();

          if (!result) {
            return corsHeaders(
              new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              })
            );
          }

          return corsHeaders(
            new Response(JSON.stringify(result), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        } catch (err: any) {
          console.error("Me error:", err);
          return corsHeaders(
            new Response(JSON.stringify({ error: "Server error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      }

      /**
       * POST /api/admin/logout
       * Clear admin session cookie
       */
      if (pathname === "/api/admin/logout" && method === "POST") {
        const response = new Response(JSON.stringify({ ok: true, message: "Logged out" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
        response.headers.set("Set-Cookie", `tc_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
        return corsHeaders(response);
      }

      // ============ SUBSCRIBERS ============

      /**
       * GET /api/admin/subscribers
       * List all subscribers with pagination and filtering
       */
      if (pathname === "/api/admin/subscribers" && method === "GET") {
        const response = await handleGetSubscribers(request, services);
        return corsHeaders(response);
      }

      /**
       * PATCH /api/admin/subscribers/:id
       * Update subscriber (toggle active status)
       */
      const subscriberPatchMatch = pathname.match(/^\/api\/admin\/subscribers\/([^/]+)$/);
      if (subscriberPatchMatch && method === "PATCH") {
        const response = await handleUpdateSubscriber(request, subscriberPatchMatch[1], services);
        return corsHeaders(response);
      }

      /**
       * DELETE /api/admin/subscribers/:id
       * Delete subscriber
       */
      const subscriberDeleteMatch = pathname.match(/^\/api\/admin\/subscribers\/([^/]+)$/);
      if (subscriberDeleteMatch && method === "DELETE") {
        const response = await handleDeleteSubscriber(request, subscriberDeleteMatch[1], services);
        return corsHeaders(response);
      }

      // ============ EVENTS ============

      /**
       * POST /api/admin/events
       * Create new event
       */
      if (pathname === "/api/admin/events" && method === "POST") {
        const response = await handleCreateEvent(request, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/admin/events/:id
       * Get single event by ID
       */
      const eventGetMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
      if (eventGetMatch && method === "GET") {
        const response = await handleGetEvent(request, eventGetMatch[1], services);
        return corsHeaders(response);
      }

      /**
       * PATCH /api/admin/events/:id
       * Update event
       */
      const eventPatchMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
      if (eventPatchMatch && method === "PATCH") {
        const response = await handleUpdateEvent(request, eventPatchMatch[1], services);
        return corsHeaders(response);
      }

      /**
       * DELETE /api/admin/events/:id
       * Delete event
       */
      const eventDeleteMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
      if (eventDeleteMatch && method === "DELETE") {
        const response = await handleDeleteEvent(request, eventDeleteMatch[1], services);
        return corsHeaders(response);
      }

      // ============ GALLERY ============

      /**
       * POST /api/admin/gallery
       * Add item to gallery
       */
      if (pathname === "/api/admin/gallery" && method === "POST") {
        const response = await handleAddGalleryItem(request, services);
        return corsHeaders(response);
      }

      /**
       * PATCH /api/admin/gallery/:id
       * Update gallery item
       */
      const galleryPatchMatch = pathname.match(/^\/api\/admin\/gallery\/([^/]+)$/);
      if (galleryPatchMatch && method === "PATCH") {
        const response = await handleUpdateGalleryItem(request, galleryPatchMatch[1], services);
        return corsHeaders(response);
      }

      /**
       * DELETE /api/admin/gallery/:id
       * Delete gallery item
       */
      const galleryDeleteMatch = pathname.match(/^\/api\/admin\/gallery\/([^/]+)$/);
      if (galleryDeleteMatch && method === "DELETE") {
        const response = await handleDeleteGalleryItem(request, galleryDeleteMatch[1], services);
        return corsHeaders(response);
      }

      // ============ DRAFTS ============

      /**
       * GET /api/admin/drafts
       * List all drafts for current admin
       */
      if (pathname === "/api/admin/drafts" && method === "GET") {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        const response = await handleGetDrafts(request, adminId, services);
        return corsHeaders(response);
      }

      /**
       * POST /api/admin/drafts
       * Create new draft
       */
      if (pathname === "/api/admin/drafts" && method === "POST") {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        const response = await handleCreateDraft(request, adminId, services);
        return corsHeaders(response);
      }

      /**
       * PATCH /api/admin/drafts/:id
       * Update draft
       */
      const draftPatchMatch = pathname.match(/^\/api\/admin\/drafts\/([^/]+)$/);
      if (draftPatchMatch && method === "PATCH") {
        const response = await handleUpdateDraft(request, draftPatchMatch[1], services);
        return corsHeaders(response);
      }

      /**
       * DELETE /api/admin/drafts/:id
       * Delete draft
       */
      const draftDeleteMatch = pathname.match(/^\/api\/admin\/drafts\/([^/]+)$/);
      if (draftDeleteMatch && method === "DELETE") {
        const response = await handleDeleteDraft(request, draftDeleteMatch[1], services);
        return corsHeaders(response);
      }

      // ============ UPLOADS ============

      /**
       * POST /api/admin/uploads
       * Upload file to R2
       */
      if (pathname === "/api/admin/uploads" && method === "POST") {
        const response = await handleUpload(request, envProxy, services);
        return corsHeaders(response);
      }

      /**
       * GET /api/admin/image/:key
       * Serve image files from R2
       */
      const imageGetMatch = pathname.match(/^\/api\/admin\/image\/(.+)$/);
      if (imageGetMatch && method === "GET") {
        const fileKey = decodeURIComponent(imageGetMatch[1]);
        console.log(`[ROUTES] GET /api/admin/image/${fileKey}`);
        const response = await handleServeImage(request, fileKey, envProxy);
        return corsHeaders(response);
      }

      /**
       * DELETE /api/admin/uploads/:key
       * Delete file from R2
       */
      const uploadDeleteMatch = pathname.match(/^\/api\/admin\/uploads\/(.+)$/);
      if (uploadDeleteMatch && method === "DELETE") {
        const response = await handleDeleteUpload(request, uploadDeleteMatch[1], envProxy, services);
        return corsHeaders(response);
      }

      // ============ 404 NOT FOUND ============

      return corsHeaders(
        new Response(JSON.stringify({ 
          error: "Not found",
          debug: {
            pathname,
            method,
            timestamp: new Date().toISOString()
          }
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );
    } catch (err) {
      console.error("Worker error:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return corsHeaders(
        new Response(JSON.stringify({ 
          error: "Internal server error",
          debug: errorMsg,
          stack: err instanceof Error ? err.stack : undefined
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  },
};
