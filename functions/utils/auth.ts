/**
 * Authentication Utilities
 */

import { UnauthorizedError } from "./errors";
import { Admin } from "../types/admin";

/**
 * Extract admin ID from tc_admin cookie
 */
export function getAdminIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "tc_admin" && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Require authentication
 * Throws UnauthorizedError if no admin cookie
 */
export function requireAuth(request: Request): string {
  const adminId = getAdminIdFromCookie(request);
  if (!adminId) {
    throw UnauthorizedError("Authentication required");
  }
  return adminId;
}

/**
 * Set secure httpOnly cookie
 */
export function setAuthCookie(adminId: string, maxAge: number = 28800): string {
  return `tc_admin=${encodeURIComponent(adminId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(): string {
  return "tc_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

/**
 * Validate admin session exists in database
 */
export async function validateAdminSession(
  db: D1Database,
  adminId: string
): Promise<Admin> {
  const result = await db
    .prepare("SELECT id, email, role, created_at, updated_at FROM admins WHERE id = ?")
    .bind(adminId)
    .first<Admin>();

  if (!result) {
    throw UnauthorizedError("Admin session invalid");
  }

  return result;
}
