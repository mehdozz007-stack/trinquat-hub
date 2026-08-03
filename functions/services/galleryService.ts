/**
 * Gallery Service
 * Business logic for gallery management
 */

import { GalleryRepository } from "../repositories/galleryRepository";
import { GalleryValidator } from "../validators/galleryValidator";
import { GalleryItem, GalleryFilter, CreateGalleryItemRequest, UpdateGalleryItemRequest } from "../types/gallery";
import { PaginatedResponse } from "../types/common";
import { NotFoundError, DatabaseError } from "../utils/errors";
import { deleteFromR2 } from "../utils/upload";

export class GalleryService {
  constructor(
    private repository: GalleryRepository,
    private r2Bucket?: R2Bucket
  ) {}

  /**
   * Get all gallery items with pagination
   */
  async getAll(filters: GalleryFilter = {}): Promise<PaginatedResponse<GalleryItem>> {
    return this.repository.getAll(filters);
  }

  /**
   * Get all gallery items ordered (for frontend)
   */
  async getAllOrdered(): Promise<GalleryItem[]> {
    return this.repository.getAllOrdered();
  }

  /**
   * Get public gallery (same as getAllOrdered)
   */
  async getPublic(): Promise<GalleryItem[]> {
    return this.repository.getAllOrdered();
  }

  /**
   * Get gallery item by ID
   */
  async getById(id: string): Promise<GalleryItem> {
    const item = await this.repository.getById(id);
    if (!item) {
      throw NotFoundError("Gallery item not found");
    }
    return item;
  }

  /**
   * Add item to gallery
   */
  async add(data: CreateGalleryItemRequest): Promise<GalleryItem> {
    // Validate input
    GalleryValidator.validateCreate(data);

    try {
      return await this.repository.create(data);
    } catch (error: any) {
      throw DatabaseError("Failed to add gallery item");
    }
  }

  /**
   * Update gallery item
   */
  async update(id: string, data: UpdateGalleryItemRequest): Promise<GalleryItem> {
    // Verify item exists
    await this.getById(id);

    // Validate input
    GalleryValidator.validateUpdate(data);

    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      throw DatabaseError("Failed to update gallery item");
    }
  }

  /**
   * Delete gallery item and associated image
   */
  async delete(id: string): Promise<void> {
    const item = await this.getById(id);

    // Delete image from R2 if exists
    if (item.image_key && this.r2Bucket) {
      try {
        await deleteFromR2(this.r2Bucket, item.image_key);
      } catch (error) {
        console.error(`Failed to delete image from R2: ${item.image_key}`, error);
      }
    }

    // Delete from database
    await this.repository.delete(id);
  }

  /**
   * Reorder gallery items
   */
  async reorder(items: Array<{ id: string; order_index: number }>): Promise<void> {
    // Validate all items exist
    for (const item of items) {
      await this.getById(item.id);
    }

    try {
      await this.repository.reorder(items);
    } catch (error: any) {
      throw DatabaseError("Failed to reorder items");
    }
  }

  /**
   * Search gallery items by title or description
   */
  async search(query: string, limit: number = 20): Promise<GalleryItem[]> {
    const allItems = await this.getAllOrdered();
    const lowerQuery = query.toLowerCase();

    return allItems
      .filter(
        (item) =>
          (item.title?.toLowerCase().includes(lowerQuery)) ||
          (item.description?.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);
  }
}
