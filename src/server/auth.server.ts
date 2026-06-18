import * as jose from "jose";
import * as bcrypt from "bcryptjs";

const COOKIE_NAME = "tc_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 heures

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(
  payload: Record<string, any>,
  secret: string,
  expSeconds: number = COOKIE_MAX_AGE
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + expSeconds)
    .sign(secretKey);
  return token;
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, any> | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as Record<string, any>;
  } catch (e) {
    return null;
  }
}

export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.trim().split("="))
    .reduce(
      (acc, [k, v]) => {
        acc[k] = v;
        return acc;
      },
      {} as Record<string, string>
    );
  return cookies[COOKIE_NAME] || null;
}

export function serializeSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
}

export function serializeLogoutCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export interface AdminSession {
  id: string;
  email: string;
  role: "admin" | "superadmin";
}

// For Nitro event handlers
export async function requireAdmin(
  requestOrEvent: Request | { headers: { get: (name: string) => string | null } },
  jwtSecret: string
): Promise<AdminSession> {
  let token: string | null = null;

  if (requestOrEvent instanceof Request) {
    token = getSessionCookie(requestOrEvent);
  } else if ("headers" in requestOrEvent && requestOrEvent.headers.get) {
    const cookieHeader = requestOrEvent.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .reduce(
          (acc, [k, v]) => {
            acc[k] = v;
            return acc;
          },
          {} as Record<string, string>
        );
      token = cookies[COOKIE_NAME] || null;
    }
  }

  if (!token) {
    throw new Error("401: Unauthorized");
  }

  const payload = await verifyJWT(token, jwtSecret);
  if (!payload) {
    throw new Error("401: Unauthorized");
  }

  return {
    id: payload.id as string,
    email: payload.email as string,
    role: (payload.role as "admin" | "superadmin") || "admin",
  };
}
