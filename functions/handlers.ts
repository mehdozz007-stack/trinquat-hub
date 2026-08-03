/**
 * API Route Handlers
 * Clean endpoints for all CRUD operations
 * (Note: CORS headers are added by _worker.ts, not here)
 */

import { Services } from "./serviceFactory";
import { successResponse, errorResponse, paginatedResponse, jsonResponse } from "./utils/response";
import { AppError, ErrorCode } from "./utils/errors";
import { requireAuth } from "./utils/auth";
import { uploadToR2, deleteFromR2 } from "./utils/upload";
import { SubscriberValidator } from "./validators/subscriberValidator";
import { EventValidator } from "./validators/eventValidator";
import { GalleryValidator } from "./validators/galleryValidator";
import { DraftValidator } from "./validators/draftValidator";

async function getJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.text();
    if (!body) return null;
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// ============ SUBSCRIBERS ============

export async function handleGetSubscribers(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));
    const search = url.searchParams.get("search") || undefined;
    const is_active = url.searchParams.get("is_active");

    const result = await services.subscriber.getAll({
      page,
      limit,
      search: search || undefined,
      is_active: is_active === "true" ? true : is_active === "false" ? false : undefined,
    });

    return paginatedResponse(result.items, result.total, result.page, result.limit);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleUpdateSubscriber(
  request: Request,
  subscriberId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = SubscriberValidator.validateUpdate(body || {});

    const updated = await services.subscriber.toggleStatus(
      subscriberId,
      validated.is_active ?? true
    );

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDeleteSubscriber(
  request: Request,
  subscriberId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    await services.subscriber.delete(subscriberId);
    return successResponse({ ok: true, id: subscriberId });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============ EVENTS ============

export async function handleGetEvents(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    console.log("[handleGetEvents] Starting");
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));
    const status = url.searchParams.get("status") as "draft" | "published" | null;
    const search = url.searchParams.get("search") || undefined;
    const is_past = url.searchParams.get("is_past");

    console.log("[handleGetEvents] About to call services.event.getAll");
    const result = await services.event.getAll({
      page,
      limit,
      status: status || undefined,
      search: search || undefined,
      is_past: is_past === "true" ? true : is_past === "false" ? false : undefined,
    });

    console.log("[handleGetEvents] Got result, returning paginatedResponse");
    return paginatedResponse(result.items, result.total, result.page, result.limit);
  } catch (error) {
    console.error("[handleGetEvents] Error:", error);
    return errorResponse(error as Error);
  }
}

export async function handleGetEvent(
  request: Request,
  id: string,
  services: Services
): Promise<Response> {
  try {
    const event = await services.event.getById(id);
    if (!event) {
      return errorResponse(new AppError("Event not found", 404, "NOT_FOUND"));
    }
    return successResponse(event);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleCreateEvent(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = EventValidator.validateCreate(body);
    const created = await services.event.create(validated);

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleUpdateEvent(
  request: Request,
  eventId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = EventValidator.validateUpdate(body);
    const updated = await services.event.update(eventId, validated);

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDeleteEvent(
  request: Request,
  eventId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    await services.event.delete(eventId);
    return successResponse({ ok: true, id: eventId });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============ GALLERY ============

export async function handleGetGallery(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));
    const sort = url.searchParams.get("sort") as "order" | "date" | null;

    const result = await services.gallery.getAll({
      page,
      limit,
      sort: sort || "order",
    });

    return paginatedResponse(result.items, result.total, result.page, result.limit);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleAddGalleryItem(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = GalleryValidator.validateCreate(body);
    const created = await services.gallery.add(validated);

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleUpdateGalleryItem(
  request: Request,
  itemId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = GalleryValidator.validateUpdate(body);
    const updated = await services.gallery.update(itemId, validated);

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDeleteGalleryItem(
  request: Request,
  itemId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    await services.gallery.delete(itemId);
    return successResponse({ ok: true, id: itemId });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============ DRAFTS ============

export async function handleGetDrafts(
  request: Request,
  adminId: string,
  services: Services
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));

    const result = await services.draft.getByAdminId(adminId, page, limit);
    return paginatedResponse(result.items, result.total, result.page, result.limit);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleCreateDraft(
  request: Request,
  adminId: string,
  services: Services
): Promise<Response> {
  try {
    const body = await getJsonBody<any>(request);
    const validated = DraftValidator.validateCreate(body);
    const created = await services.draft.create(adminId, validated);

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleUpdateDraft(
  request: Request,
  draftId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    const body = await getJsonBody<any>(request);
    const validated = DraftValidator.validateUpdate(body);
    const updated = await services.draft.update(draftId, validated);

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDeleteDraft(
  request: Request,
  draftId: string,
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);
    await services.draft.delete(draftId);
    return successResponse({ ok: true, id: draftId });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============ UPLOADS ============

export async function handleUpload(
  request: Request,
  env: { MEDIA?: R2Bucket; MEDIA_PUBLIC_URL?: string },
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    if (!env.MEDIA || !env.MEDIA_PUBLIC_URL) {
      throw new AppError(ErrorCode.UPLOAD_ERROR, "R2 bucket not configured", 500);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, "No file provided", 400);
    }

    const result = await uploadToR2(file, {
      bucket: env.MEDIA,
      mediaUrl: env.MEDIA_PUBLIC_URL,
      folder: "events",
    });

    return successResponse({
      key: result.key,
      url: `/uploads/${encodeURIComponent(result.key)}`,
      contentType: result.contentType,
      size: result.size,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function handleDeleteUpload(
  request: Request,
  fileKey: string,
  env: { MEDIA?: R2Bucket },
  services: Services
): Promise<Response> {
  try {
    requireAuth(request);

    if (!env.MEDIA) {
      throw new AppError(ErrorCode.UPLOAD_ERROR, "R2 bucket not configured", 500);
    }

    const decodedKey = decodeURIComponent(fileKey);
    await deleteFromR2(env.MEDIA, decodedKey);

    return successResponse({ ok: true, key: fileKey });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// ============ PUBLIC ENDPOINTS ============

/**
 * GET /api/events - Public endpoint for upcoming events
 */
export async function handleGetUpcomingEvents(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const limit = 10;
    const events = await services.event.getUpcoming(limit);
    return jsonResponse({ events });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * GET /api/events/past - Public endpoint for past events
 */
export async function handleGetPastEvents(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const limit = 50;
    const events = await services.event.getPast(limit);
    return jsonResponse({ events });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * GET /api/news - Public endpoint for news/actualités
 * For now, returns published news articles (same structure as events)
 */
export async function handleGetNews(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const limit = 10;
    // TODO: Implement news service when needed
    // For now, return empty array with correct structure
    return jsonResponse({ news: [] });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * Public gallery endpoint - returns all gallery items ordered
 */
export async function handleGetPublicGallery(
  request: Request,
  services: Services
): Promise<Response> {
  try {
    const items = await services.gallery.getPublic();
    return jsonResponse({ items });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * Serve image from R2
 */
export async function handleServeImage(
  request: Request,
  fileKey: string,
  env: { MEDIA?: R2Bucket }
): Promise<Response> {
  try {
    if (!env.MEDIA) {
      return new Response("R2 bucket not configured", { status: 500 });
    }

    const object = await env.MEDIA.get(fileKey);
    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    // Return image with proper headers
    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
