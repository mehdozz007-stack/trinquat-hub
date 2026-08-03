/**
 * Draft Repository
 * Data access layer for newsletter drafts
 */

import { Draft, CreateDraftRequest, UpdateDraftRequest, DraftWithAdmin } from "../types/draft";
import { PaginatedResponse } from "../types/common";

export class DraftRepository {
  constructor(private db: D1Database) {}

  /**
   * Get all drafts for an admin with pagination
   */
  async getAllByAdminId(
    adminId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<DraftWithAdmin>> {
    const offset = (Math.max(1, page) - 1) * limit;

    // Get total count
    const countResult = await this.db
      .prepare("SELECT COUNT(*) as count FROM drafts WHERE admin_id = ?")
      .bind(adminId)
      .first<{ count: number }>();

    const total = countResult?.count || 0;

    // Get paginated results with admin email
    const items = await this.db
      .prepare(
        `SELECT d.id, d.admin_id, d.subject, d.content, d.created_at, d.updated_at, a.email as admin_email
         FROM drafts d
         LEFT JOIN admins a ON d.admin_id = a.id
         WHERE d.admin_id = ?
         ORDER BY d.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(adminId, limit, offset)
      .all<DraftWithAdmin>();

    return {
      items: items.results || [],
      total,
      page: Math.max(1, page),
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get draft by ID
   */
  async getById(id: string): Promise<Draft | null> {
    return this.db
      .prepare(
        "SELECT id, admin_id, subject, content, created_at, updated_at FROM drafts WHERE id = ?"
      )
      .bind(id)
      .first<Draft>();
  }

  /**
   * Get draft by ID with admin info
   */
  async getByIdWithAdmin(id: string): Promise<DraftWithAdmin | null> {
    return this.db
      .prepare(
        `SELECT d.id, d.admin_id, d.subject, d.content, d.created_at, d.updated_at, a.email as admin_email
         FROM drafts d
         LEFT JOIN admins a ON d.admin_id = a.id
         WHERE d.id = ?`
      )
      .bind(id)
      .first<DraftWithAdmin>();
  }

  /**
   * Create draft
   */
  async create(adminId: string, data: CreateDraftRequest): Promise<Draft> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO drafts (id, admin_id, subject, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, adminId, data.subject, data.content, now, now)
      .run();

    return {
      id,
      admin_id: adminId,
      subject: data.subject,
      content: data.content,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Update draft
   */
  async update(id: string, updates: UpdateDraftRequest): Promise<Draft> {
    const draft = await this.getById(id);
    if (!draft) {
      throw new Error("Draft not found");
    }

    const updated_at = new Date().toISOString();

    await this.db
      .prepare(
        "UPDATE drafts SET subject = ?, content = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        updates.subject || draft.subject,
        updates.content || draft.content,
        updated_at,
        id
      )
      .run();

    return {
      ...draft,
      subject: updates.subject || draft.subject,
      content: updates.content || draft.content,
      updated_at,
    };
  }

  /**
   * Delete draft
   */
  async delete(id: string): Promise<Draft | null> {
    const draft = await this.getById(id);
    if (!draft) return null;

    await this.db
      .prepare("DELETE FROM drafts WHERE id = ?")
      .bind(id)
      .run();

    return draft;
  }

  /**
   * Delete all drafts for an admin
   */
  async deleteByAdminId(adminId: string): Promise<void> {
    await this.db
      .prepare("DELETE FROM drafts WHERE admin_id = ?")
      .bind(adminId)
      .run();
  }
}
