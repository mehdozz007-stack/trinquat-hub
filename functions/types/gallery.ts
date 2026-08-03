/**
 * Gallery Types
 */

export interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_key: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGalleryItemRequest {
  title?: string;
  description?: string;
  image_url: string;
  image_key: string;
  order_index?: number;
}

export interface UpdateGalleryItemRequest {
  title?: string;
  description?: string;
  order_index?: number;
}

export interface GalleryFilter {
  page?: number;
  limit?: number;
  sort?: "order" | "date";
}
