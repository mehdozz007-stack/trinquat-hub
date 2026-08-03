/**
 * Gallery Validators
 */

import { CreateGalleryItemRequest, UpdateGalleryItemRequest } from "../types/gallery";
import { ValidationError } from "../utils/errors";

export class GalleryValidator {
  /**
   * Validate create gallery item request
   */
  static validateCreate(data: unknown): CreateGalleryItemRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;

    // Required fields
    const { image_url, image_key } = body;

    if (!image_url || typeof image_url !== "string") {
      throw ValidationError("image_url is required and must be a string");
    }

    if (!image_key || typeof image_key !== "string") {
      throw ValidationError("image_key is required and must be a string");
    }

    // Optional fields
    const title = body.title ? String(body.title).trim() : undefined;
    const description = body.description ? String(body.description).trim() : undefined;
    const order_index = body.order_index ? Number(body.order_index) : undefined;

    if (title && title.length > 255) {
      throw ValidationError("Title must not exceed 255 characters");
    }

    if (description && description.length > 1000) {
      throw ValidationError("Description must not exceed 1000 characters");
    }

    if (order_index !== undefined && (!Number.isInteger(order_index) || order_index < 0)) {
      throw ValidationError("order_index must be a non-negative integer");
    }

    return {
      title: title || undefined,
      description: description || undefined,
      image_url,
      image_key,
      order_index,
    };
  }

  /**
   * Validate update gallery item request
   */
  static validateUpdate(data: unknown): UpdateGalleryItemRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;
    const result: UpdateGalleryItemRequest = {};

    if (body.title !== undefined) {
      result.title = body.title ? String(body.title).trim() : null;
      if (result.title && result.title.length > 255) {
        throw ValidationError("Title must not exceed 255 characters");
      }
    }

    if (body.description !== undefined) {
      result.description = body.description ? String(body.description).trim() : null;
      if (result.description && result.description.length > 1000) {
        throw ValidationError("Description must not exceed 1000 characters");
      }
    }

    if (body.order_index !== undefined) {
      const order_index = Number(body.order_index);
      if (!Number.isInteger(order_index) || order_index < 0) {
        throw ValidationError("order_index must be a non-negative integer");
      }
      result.order_index = order_index;
    }

    return result;
  }
}
