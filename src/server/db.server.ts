import { getRequest } from "@tanstack/react-start/server";

export function getDB(): D1Database {
  const event = getRequest();
  // @ts-ignore - bindings Cloudflare exposés via event.context
  const db = event?.context?.cloudflare?.env?.DB ?? (globalThis as any).DB;
  if (!db) throw new Error('D1 binding "DB" introuvable');
  return db as D1Database;
}