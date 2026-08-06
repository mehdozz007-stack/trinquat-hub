/**
 * Event Repository
 * Data access layer for events
 */

import { Event, EventFilter, CreateEventRequest, UpdateEventRequest } from "../types/event";
import { PaginatedResponse } from "../types/common";

export class EventRepository {
  constructor(private db: D1Database) {}

  /**
   * Get all events with filtering and pagination
   */
  async getAll(filters: EventFilter = {}): Promise<PaginatedResponse<Event>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, filters.limit || 20);
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: any[] = [];

    // Filter by status
    if (filters.status) {
      whereClause += "status = ?";
      params.push(filters.status);
    }

    // Filter by past/upcoming
    if (filters.is_past !== undefined) {
      const today = new Date().toISOString().split("T")[0];
      const operator = filters.is_past ? "<" : ">=";
      if (whereClause) whereClause += " AND ";
      whereClause += `event_date ${operator} ?`;
      params.push(today);
    }

    // Search in title/description
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      if (whereClause) whereClause += " AND ";
      whereClause += "(title LIKE ? OR description LIKE ?)";
      params.push(searchTerm, searchTerm);
    }

    const whereSQL = whereClause ? ` WHERE ${whereClause}` : "";

    // Get total count
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as count FROM events${whereSQL}`)
      .bind(...params)
      .first<{ count: number }>();

    const total = countResult?.count || 0;

    // Get paginated results
    const items = await this.db
      .prepare(
        `SELECT id, title, description, event_date, place, badge, category, image_url, image_key, 
                status, published_at, created_at, updated_at
         FROM events${whereSQL}
         ORDER BY event_date DESC, created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all<Event>();

    return {
      items: items.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event | null> {
    return this.db
      .prepare(
        `SELECT id, title, description, event_date, place, badge, category, image_url, image_key,
                status, published_at, created_at, updated_at
         FROM events WHERE id = ?`
      )
      .bind(id)
      .first<Event>();
  }

  /**
   * Create event
   */
  async create(data: CreateEventRequest): Promise<Event> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const status = data.status || "draft";

    await this.db
      .prepare(
        `INSERT INTO events 
         (id, title, description, event_date, place, badge, category, image_url, image_key, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.title,
        data.description,
        data.event_date,
        data.place || null,
        data.badge || null,
        data.category || null,
        data.image_url || null,
        data.image_key || null,
        status,
        status === "published" ? now : null,
        now,
        now
      )
      .run();

    return {
      id,
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      place: data.place || null,
      badge: data.badge || null,
      category: data.category || null,
      image_url: data.image_url || null,
      image_key: data.image_key || null,
      status,
      published_at: status === "published" ? now : null,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Update event
   */
  async update(id: string, updates: UpdateEventRequest): Promise<Event> {
    const event = await this.getById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    const updated_at = new Date().toISOString();
    const status = updates.status !== undefined ? updates.status : event.status;
    const published_at =
      status === "published" && !event.published_at ? updated_at : event.published_at;

    await this.db
      .prepare(
        `UPDATE events SET
         title = ?, description = ?, event_date = ?, place = ?, badge = ?, category = ?,
         image_url = ?, image_key = ?, status = ?, published_at = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(
        updates.title || event.title,
        updates.description || event.description,
        updates.event_date || event.event_date,
        updates.place !== undefined ? updates.place : event.place,
        updates.badge !== undefined ? updates.badge : event.badge,
        updates.category !== undefined ? updates.category : event.category,
        updates.image_url !== undefined ? updates.image_url : event.image_url,
        updates.image_key !== undefined ? updates.image_key : event.image_key,
        status,
        published_at,
        updated_at,
        id
      )
      .run();

    return {
      ...event,
      ...updates,
      status,
      published_at,
      updated_at,
    };
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<Event | null> {
    const event = await this.getById(id);
    if (!event) return null;

    await this.db
      .prepare("DELETE FROM events WHERE id = ?")
      .bind(id)
      .run();

    return event;
  }

  /**
   * Get published upcoming events
   */
  async getUpcoming(limit: number = 10): Promise<Event[]> {
    const today = new Date().toISOString().split("T")[0];

    const items = await this.db
      .prepare(
        `SELECT id, title, description, event_date, place, badge, category, image_url, image_key,
                status, published_at, created_at, updated_at
         FROM events
         WHERE status = 'published' AND event_date >= ?
         ORDER BY event_date ASC
         LIMIT ?`
      )
      .bind(today, limit)
      .all<Event>();

    return items.results || [];
  }

  /**
   * Get published past events
   */
  async getPast(limit: number = 10): Promise<Event[]> {
    const today = new Date().toISOString().split("T")[0];

    const items = await this.db
      .prepare(
        `SELECT id, title, description, event_date, place, badge, category, image_url, image_key,
                status, published_at, created_at, updated_at
         FROM events
         WHERE status = 'published' AND event_date < ?
         ORDER BY event_date DESC
         LIMIT ?`
      )
      .bind(today, limit)
      .all<Event>();

    return items.results || [];
  }
}
