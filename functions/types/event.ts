/**
 * Event Types
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  place: string | null;
  badge: string | null;
  category: string | null;
  image_url: string | null;
  image_key: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRow extends Event {
  // Same as Event, for compatibility with frontend
}

export interface CreateEventRequest {
  title: string;
  description: string;
  event_date: string;
  place?: string;
  badge?: string;
  category?: string;
  image_url?: string;
  image_key?: string;
  status?: "draft" | "published";
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  event_date?: string;
  place?: string;
  badge?: string;
  category?: string;
  image_url?: string;
  image_key?: string;
  status?: "draft" | "published";
}

export interface EventFilter {
  status?: "draft" | "published";
  is_past?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface SentNewsletter {
  id: string;
  admin_id: string;
  subject: string;
  recipient_count: number;
  sent_at: string;
}
