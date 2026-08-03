/**
 * Subscriber Repository
 * Data access layer for subscribers
 */

import { Subscriber, SubscriberFilter } from "../types/subscriber";
import { PaginatedResponse } from "../types/common";

export class SubscriberRepository {
  constructor(private db: D1Database) {}

  /**
   * Get all subscribers with pagination and filtering
   */
  async getAll(filters: SubscriberFilter = {}): Promise<PaginatedResponse<Subscriber>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, filters.limit || 20);
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: any[] = [];

    if (filters.is_active !== undefined) {
      whereClause += "is_active = ?";
      params.push(filters.is_active ? 1 : 0);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      if (whereClause) whereClause += " AND ";
      whereClause += "email LIKE ?";
      params.push(searchTerm);
    }

    const whereSQL = whereClause ? ` WHERE ${whereClause}` : "";

    // Get total count
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as count FROM subscribers${whereSQL}`)
      .bind(...params)
      .first<{ count: number }>();

    const total = countResult?.count || 0;

    // Get paginated results
    const items = await this.db
      .prepare(
        `SELECT id, email, is_active, created_at, updated_at FROM subscribers${whereSQL}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all<Subscriber>();

    return {
      items: items.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get subscriber by ID
   */
  async getById(id: string): Promise<Subscriber | null> {
    return this.db
      .prepare(
        "SELECT id, email, is_active, created_at, updated_at FROM subscribers WHERE id = ?"
      )
      .bind(id)
      .first<Subscriber>();
  }

  /**
   * Get subscriber by email
   */
  async getByEmail(email: string): Promise<Subscriber | null> {
    return this.db
      .prepare(
        "SELECT id, email, is_active, created_at, updated_at FROM subscribers WHERE LOWER(email) = LOWER(?)"
      )
      .bind(email)
      .first<Subscriber>();
  }

  /**
   * Create subscriber
   */
  async create(email: string): Promise<Subscriber> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO subscribers (id, email, is_active, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?)`
      )
      .bind(id, email, now, now)
      .run();

    if (!result.success) {
      throw new Error("Failed to create subscriber");
    }

    return {
      id,
      email,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Update subscriber (primarily to toggle is_active)
   */
  async update(id: string, updates: { is_active?: boolean }): Promise<Subscriber> {
    const subscriber = await this.getById(id);
    if (!subscriber) {
      throw new Error("Subscriber not found");
    }

    const updated_at = new Date().toISOString();
    const is_active = updates.is_active !== undefined ? (updates.is_active ? 1 : 0) : subscriber.is_active;

    await this.db
      .prepare("UPDATE subscribers SET is_active = ?, updated_at = ? WHERE id = ?")
      .bind(is_active, updated_at, id)
      .run();

    return {
      ...subscriber,
      is_active: is_active === 1,
      updated_at,
    };
  }

  /**
   * Delete subscriber
   */
  async delete(id: string): Promise<void> {
    await this.db
      .prepare("DELETE FROM subscribers WHERE id = ?")
      .bind(id)
      .run();
  }

  /**
   * Count active subscribers
   */
  async countActive(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1")
      .first<{ count: number }>();

    return result?.count || 0;
  }
}
