/**
 * Common Types & Interfaces
 * Shared across the application
 */

export interface Env {
  trinquat_newsletter: D1Database;
  MEDIA: R2Bucket;
  MEDIA_PUBLIC_URL: string;
  RESEND_API_KEY?: string;
  JWT_SECRET?: string;
  ADMIN_BOOTSTRAP_TOKEN?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}
