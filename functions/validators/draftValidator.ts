/**
 * Draft Validators
 */

import { CreateDraftRequest, UpdateDraftRequest } from "../types/draft";
import { ValidationError } from "../utils/errors";

export class DraftValidator {
  /**
   * Validate create draft request
   */
  static validateCreate(data: unknown): CreateDraftRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;

    // Required fields
    const { subject, content } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      throw ValidationError("Subject is required and must be a non-empty string");
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      throw ValidationError("Content is required and must be a non-empty string");
    }

    if (subject.trim().length > 255) {
      throw ValidationError("Subject must not exceed 255 characters");
    }

    if (content.trim().length > 50000) {
      throw ValidationError("Content must not exceed 50000 characters");
    }

    return {
      subject: subject.trim(),
      content: content.trim(),
    };
  }

  /**
   * Validate update draft request
   */
  static validateUpdate(data: unknown): UpdateDraftRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const body = data as Record<string, unknown>;
    const result: UpdateDraftRequest = {};

    if (body.subject !== undefined) {
      if (!body.subject || typeof body.subject !== "string" || !body.subject.toString().trim()) {
        throw ValidationError("Subject must be a non-empty string");
      }
      const subject = body.subject.toString().trim();
      if (subject.length > 255) {
        throw ValidationError("Subject must not exceed 255 characters");
      }
      result.subject = subject;
    }

    if (body.content !== undefined) {
      if (!body.content || typeof body.content !== "string" || !body.content.toString().trim()) {
        throw ValidationError("Content must be a non-empty string");
      }
      const content = body.content.toString().trim();
      if (content.length > 50000) {
        throw ValidationError("Content must not exceed 50000 characters");
      }
      result.content = content;
    }

    return result;
  }
}
