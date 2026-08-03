/**
 * Subscriber Service
 * Business logic for subscriber management
 */

import { SubscriberRepository } from "../repositories/subscriberRepository";
import { SubscriberValidator } from "../validators/subscriberValidator";
import { Subscriber, SubscriberFilter } from "../types/subscriber";
import { PaginatedResponse } from "../types/common";
import { ConflictError, NotFoundError, DatabaseError } from "../utils/errors";

export class SubscriberService {
  constructor(private repository: SubscriberRepository) {}

  /**
   * Get all subscribers with filtering
   */
  async getAll(filters: SubscriberFilter = {}): Promise<PaginatedResponse<Subscriber>> {
    return this.repository.getAll(filters);
  }

  /**
   * Get subscriber by ID
   */
  async getById(id: string): Promise<Subscriber> {
    const subscriber = await this.repository.getById(id);
    if (!subscriber) {
      throw NotFoundError("Subscriber not found");
    }
    return subscriber;
  }

  /**
   * Subscribe email to newsletter
   */
  async subscribe(email: string): Promise<Subscriber> {
    // Validate email
    SubscriberValidator.validateCreate({ email });

    // Check if already exists
    const existing = await this.repository.getByEmail(email);
    if (existing && existing.is_active) {
      throw ConflictError("Email already subscribed");
    }

    // If exists but inactive, reactivate
    if (existing) {
      return this.repository.update(existing.id, { is_active: true });
    }

    // Create new subscriber
    try {
      return await this.repository.create(email);
    } catch (error: any) {
      if (error.message?.includes("UNIQUE")) {
        throw ConflictError("Email already exists");
      }
      throw DatabaseError("Failed to subscribe");
    }
  }

  /**
   * Toggle subscriber status
   */
  async toggleStatus(id: string, is_active: boolean): Promise<Subscriber> {
    const subscriber = await this.getById(id);
    return this.repository.update(id, { is_active });
  }

  /**
   * Unsubscribe email
   */
  async unsubscribe(id: string): Promise<Subscriber> {
    const subscriber = await this.getById(id);
    return this.repository.update(id, { is_active: false });
  }

  /**
   * Delete subscriber
   */
  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repository.delete(id);
  }

  /**
   * Get active subscriber count
   */
  async getActiveCount(): Promise<number> {
    return this.repository.countActive();
  }

  /**
   * Search subscribers
   */
  async search(query: string, limit: number = 20): Promise<Subscriber[]> {
    const result = await this.repository.getAll({
      search: query,
      limit,
      page: 1,
    });
    return result.items;
  }
}
