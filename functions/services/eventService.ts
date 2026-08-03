/**
 * Event Service
 * Business logic for event management
 */

import { EventRepository } from "../repositories/eventRepository";
import { EventValidator } from "../validators/eventValidator";
import { Event, EventFilter, CreateEventRequest, UpdateEventRequest } from "../types/event";
import { PaginatedResponse } from "../types/common";
import { NotFoundError, DatabaseError } from "../utils/errors";
import { deleteFromR2, deleteMultipleFromR2 } from "../utils/upload";

export class EventService {
  constructor(
    private repository: EventRepository,
    private r2Bucket?: R2Bucket
  ) {}

  /**
   * Get all events with filtering
   */
  async getAll(filters: EventFilter = {}): Promise<PaginatedResponse<Event>> {
    return this.repository.getAll(filters);
  }

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    const event = await this.repository.getById(id);
    if (!event) {
      throw NotFoundError("Event not found");
    }
    return event;
  }

  /**
   * Create event
   */
  async create(data: CreateEventRequest): Promise<Event> {
    // Validate input
    EventValidator.validateCreate(data);

    try {
      return await this.repository.create(data);
    } catch (error: any) {
      throw DatabaseError("Failed to create event");
    }
  }

  /**
   * Update event
   */
  async update(id: string, data: UpdateEventRequest): Promise<Event> {
    // Verify event exists
    await this.getById(id);

    // Validate input
    EventValidator.validateUpdate(data);

    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      throw DatabaseError("Failed to update event");
    }
  }

  /**
   * Publish event
   */
  async publish(id: string): Promise<Event> {
    const event = await this.getById(id);
    return this.repository.update(id, { status: "published" });
  }

  /**
   * Unpublish event
   */
  async unpublish(id: string): Promise<Event> {
    const event = await this.getById(id);
    return this.repository.update(id, { status: "draft" });
  }

  /**
   * Delete event and associated images
   */
  async delete(id: string): Promise<void> {
    const event = await this.getById(id);

    // Delete image from R2 if exists
    if (event.image_key && this.r2Bucket) {
      try {
        await deleteFromR2(this.r2Bucket, event.image_key);
      } catch (error) {
        // Log but don't fail deletion if R2 fails
        console.error(`Failed to delete image from R2: ${event.image_key}`, error);
      }
    }

    // Delete from database
    await this.repository.delete(id);
  }

  /**
   * Get upcoming events (published)
   */
  async getUpcoming(limit: number = 10): Promise<Event[]> {
    return this.repository.getUpcoming(limit);
  }

  /**
   * Get past events (published)
   */
  async getPast(limit: number = 10): Promise<Event[]> {
    return this.repository.getPast(limit);
  }

  /**
   * Search events
   */
  async search(query: string, limit: number = 20): Promise<Event[]> {
    const result = await this.repository.getAll({
      search: query,
      limit,
      page: 1,
    });
    return result.items;
  }

  /**
   * Update event image
   */
  async updateImage(
    id: string,
    imageUrl: string,
    imageKey: string,
    oldImageKey?: string
  ): Promise<Event> {
    const event = await this.getById(id);

    // Delete old image if exists and different
    if (oldImageKey && oldImageKey !== imageKey && this.r2Bucket) {
      try {
        await deleteFromR2(this.r2Bucket, oldImageKey);
      } catch (error) {
        console.error(`Failed to delete old image: ${oldImageKey}`, error);
      }
    }

    return this.repository.update(id, {
      image_url: imageUrl,
      image_key: imageKey,
    });
  }
}
