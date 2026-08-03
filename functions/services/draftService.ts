/**
 * Draft Service
 * Business logic for newsletter draft management
 */

import { DraftRepository } from "../repositories/draftRepository";
import { DraftValidator } from "../validators/draftValidator";
import { Draft, CreateDraftRequest, UpdateDraftRequest, DraftWithAdmin } from "../types/draft";
import { PaginatedResponse } from "../types/common";
import { NotFoundError, DatabaseError } from "../utils/errors";

export class DraftService {
  constructor(private repository: DraftRepository) {}

  /**
   * Get all drafts for an admin
   */
  async getByAdminId(
    adminId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<DraftWithAdmin>> {
    return this.repository.getAllByAdminId(adminId, page, limit);
  }

  /**
   * Get draft by ID
   */
  async getById(id: string): Promise<Draft> {
    const draft = await this.repository.getById(id);
    if (!draft) {
      throw NotFoundError("Draft not found");
    }
    return draft;
  }

  /**
   * Get draft by ID with admin info
   */
  async getByIdWithAdmin(id: string): Promise<DraftWithAdmin> {
    const draft = await this.repository.getByIdWithAdmin(id);
    if (!draft) {
      throw NotFoundError("Draft not found");
    }
    return draft;
  }

  /**
   * Create draft
   */
  async create(adminId: string, data: CreateDraftRequest): Promise<Draft> {
    // Validate input
    DraftValidator.validateCreate(data);

    try {
      return await this.repository.create(adminId, data);
    } catch (error: any) {
      throw DatabaseError("Failed to create draft");
    }
  }

  /**
   * Update draft
   */
  async update(id: string, data: UpdateDraftRequest): Promise<Draft> {
    // Verify draft exists
    await this.getById(id);

    // Validate input
    DraftValidator.validateUpdate(data);

    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      throw DatabaseError("Failed to update draft");
    }
  }

  /**
   * Delete draft
   */
  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repository.delete(id);
  }

  /**
   * Delete all drafts for an admin
   */
  async deleteByAdminId(adminId: string): Promise<void> {
    await this.repository.deleteByAdminId(adminId);
  }

  /**
   * Search drafts by subject or content
   */
  async search(
    adminId: string,
    query: string,
    limit: number = 20
  ): Promise<Draft[]> {
    const result = await this.repository.getAllByAdminId(adminId, 1, limit);
    const lowerQuery = query.toLowerCase();

    return result.items
      .filter(
        (draft) =>
          draft.subject.toLowerCase().includes(lowerQuery) ||
          draft.content.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }
}
