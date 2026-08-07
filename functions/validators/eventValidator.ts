/**
 * Event Validators
 */

import { CreateEventRequest, UpdateEventRequest } from "../types/event";
import { ValidationError } from "../utils/errors";

export class EventValidator {
  /**
   * Validate create event request
   */
  static validateCreate(data: unknown): CreateEventRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;

    // Required fields
    const { title, description, event_date } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      throw ValidationError("Title is required and must be a string");
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      throw ValidationError("Description is required and must be a string");
    }

    if (!event_date || typeof event_date !== "string") {
      throw ValidationError("Event date is required and must be a string (YYYY-MM-DD)");
    }

    if (!this.isValidDate(event_date)) {
      throw ValidationError("Invalid event date format (use YYYY-MM-DD)");
    }

    // Optional fields
    const place = body.place ? String(body.place).trim() : undefined;
    const badge = body.badge ? String(body.badge).trim() : undefined;
    const category = body.category ? String(body.category).trim() : undefined;
    const image_url = body.image_url ? String(body.image_url) : undefined;
    const image_key = body.image_key ? String(body.image_key) : undefined;
    const status = body.status === "published" ? "published" : "draft";

    if (place && place.length > 255) {
      throw ValidationError("Place must not exceed 255 characters");
    }

    if (badge && badge.length > 100) {
      throw ValidationError("Badge must not exceed 100 characters");
    }

    if (category && category.length > 100) {
      throw ValidationError("Category must not exceed 100 characters");
    }

    return {
      title: title.trim(),
      description: description.trim(),
      event_date,
      place: place || undefined,
      badge: badge || undefined,
      category: category || undefined,
      image_url,
      image_key,
      status,
    };
  }

  /**
   * Validate update event request
   */
  static validateUpdate(data: unknown): UpdateEventRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;
    const result: UpdateEventRequest = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        throw ValidationError("Title must be a non-empty string");
      }
      result.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        throw ValidationError("Description must be a non-empty string");
      }
      result.description = body.description.trim();
    }

    if (body.event_date !== undefined) {
      if (typeof body.event_date !== "string" || !this.isValidDate(body.event_date)) {
        throw ValidationError("Invalid event date format (use YYYY-MM-DD)");
      }
      result.event_date = body.event_date;
    }

    if (body.place !== undefined) {
      result.place = body.place ? String(body.place).trim() : null;
      if (result.place && result.place.length > 255) {
        throw ValidationError("Place must not exceed 255 characters");
      }
    }

    if (body.badge !== undefined) {
      result.badge = body.badge ? String(body.badge).trim() : null;
      if (result.badge && result.badge.length > 100) {
        throw ValidationError("Badge must not exceed 100 characters");
      }
    }

    if (body.category !== undefined) {
      result.category = body.category ? String(body.category).trim() : null;
      if (result.category && result.category.length > 100) {
        throw ValidationError("Category must not exceed 100 characters");
      }
    }

    if (body.image_url !== undefined) {
      result.image_url = body.image_url ? String(body.image_url) : null;
    }

    if (body.image_key !== undefined) {
      result.image_key = body.image_key ? String(body.image_key) : null;
    }

    if (body.status !== undefined) {
      if (body.status !== "published" && body.status !== "draft") {
        throw ValidationError("Status must be 'published' or 'draft'");
      }
      result.status = body.status;
    }

    return result;
  }

  /**
   * Check if date is in YYYY-MM-DD format
   */
  private static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString + "T00:00:00Z");
    return !isNaN(date.getTime());
  }
}
