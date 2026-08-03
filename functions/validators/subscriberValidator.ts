/**
 * Subscriber Validators
 */

import { CreateSubscriberRequest, UpdateSubscriberRequest } from "../types/subscriber";
import { ValidationError } from "../utils/errors";

export class SubscriberValidator {
  /**
   * Validate create subscriber request
   */
  static validateCreate(data: unknown): CreateSubscriberRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const { email } = data as Record<string, unknown>;

    if (!email || typeof email !== "string") {
      throw ValidationError("Email is required");
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(trimmedEmail)) {
      throw ValidationError("Email format is invalid");
    }

    return { email: trimmedEmail };
  }

  /**
   * Validate update subscriber request
   */
  static validateUpdate(data: unknown): UpdateSubscriberRequest {
    if (!data || typeof data !== "object") {
      throw ValidationError("Invalid request body");
    }

    const { is_active } = data as Record<string, unknown>;

    if (is_active !== undefined && typeof is_active !== "boolean") {
      throw ValidationError("is_active must be a boolean");
    }

    return { is_active };
  }

  /**
   * Check if email is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }
}
