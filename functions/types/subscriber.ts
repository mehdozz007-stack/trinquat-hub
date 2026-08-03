/**
 * Subscriber Types
 */

export interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriberRequest {
  email: string;
}

export interface UpdateSubscriberRequest {
  is_active?: boolean;
}

export interface SubscriberFilter {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
