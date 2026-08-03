/**
 * Admin Types
 */

export interface Admin {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  created_at: string;
  updated_at: string;
}

export interface AdminSession extends Omit<Admin, "created_at" | "updated_at"> {
  // Session-specific admin data
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  message?: string;
}
