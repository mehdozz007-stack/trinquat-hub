/**
 * Gallery Repository
 * Data access layer for gallery items
 */

import { GalleryItem, GalleryFilter, CreateGalleryItemRequest, UpdateGalleryItemRequest } from "../types/gallery";
import { PaginatedResponse } from "../types/common";

export class GalleryRepository {
  constructor(private db: D1Database) {}

  /**
   * Get all gallery items with pagination
   */
  async getAll(filters: GalleryFilter = {}): Promise<PaginatedResponse<GalleryItem>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, filters.limit || 20);
    const offset = (page - 1) * limit;

    const sort = filters.sort === "date" ? "created_at DESC" : "order_index ASC";

    // Get total count
    const countResult = await this.db
      .prepare("SELECT COUNT(*) as count FROM gallery")
      .first<{ count: number }>();

    const total = countResult?.count || 0;

    // Get paginated results
    const items = await this.db
      .prepare(
        `SELECT id, title, description, image_url, image_key, order_index, created_at, updated_at
         FROM gallery
         ORDER BY ${sort}
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all<GalleryItem>();

    return {
      items: items.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all gallery items without pagination (for frontend display)
   */
  async getAllOrdered(): Promise<GalleryItem[]> {
    const items = await this.db
      .prepare(
        `SELECT id, title, description, image_url, image_key, order_index, created_at, updated_at
         FROM gallery
         ORDER BY order_index ASC`
      )
      .all<GalleryItem>();

    return items.results || [];
  }

  /**
   * Get gallery item by ID
   */
  async getById(id: string): Promise<GalleryItem | null> {
    return this.db
      .prepare(
        "SELECT id, title, description, image_url, image_key, order_index, created_at, updated_at FROM gallery WHERE id = ?"
      )
      .bind(id)
      .first<GalleryItem>();
  }

  /**
   * Create gallery item
   */
  async create(data: CreateGalleryItemRequest): Promise<GalleryItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Get next order_index
    const maxOrder = await this.db
      .prepare("SELECT COALESCE(MAX(order_index), 0) as max_order FROM gallery")
      .first<{ max_order: number }>();

    const order_index = (maxOrder?.max_order || 0) + 1;

    await this.db
      .prepare(
        `INSERT INTO gallery (id, title, description, image_url, image_key, order_index, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.title || null,
        data.description || null,
        data.image_url,
        data.image_key,
        data.order_index || order_index,
        now,
        now
      )
      .run();

    return {
      id,
      title: data.title || null,
      description: data.description || null,
      image_url: data.image_url,
      image_key: data.image_key,
      order_index: data.order_index || order_index,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Update gallery item
   */
  async update(id: string, updates: UpdateGalleryItemRequest): Promise<GalleryItem> {
    const item = await this.getById(id);
    if (!item) {
      throw new Error("Gallery item not found");
    }

    const updated_at = new Date().toISOString();

    await this.db
      .prepare(
        "UPDATE gallery SET title = ?, description = ?, order_index = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        updates.title !== undefined ? updates.title : item.title,
        updates.description !== undefined ? updates.description : item.description,
        updates.order_index !== undefined ? updates.order_index : item.order_index,
        updated_at,
        id
      )
      .run();

    return {
      ...item,
      ...updates,
      updated_at,
    };
  }

  /**
   * Delete gallery item
   */
  async delete(id: string): Promise<GalleryItem | null> {
    const item = await this.getById(id);
    if (!item) return null;

    await this.db
      .prepare("DELETE FROM gallery WHERE id = ?")
      .bind(id)
      .run();

    return item;
  }

  /**
   * Reorder gallery items
   */
  async reorder(items: Array<{ id: string; order_index: number }>): Promise<void> {
    const updated_at = new Date().toISOString();

    for (const item of items) {
      await this.db
        .prepare("UPDATE gallery SET order_index = ?, updated_at = ? WHERE id = ?")
        .bind(item.order_index, updated_at, item.id)
        .run();
    }
  }
}
