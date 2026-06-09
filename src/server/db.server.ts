import { getRequestEvent } from "@tanstack/react-start/server";

export function getDB(): D1Database {
  const event = getRequestEvent();
  // @ts-ignore - bindings Cloudflare exposés via event.context
  const db = event?.context?.cloudflare?.env?.DB ?? (globalThis as any).DB;
  if (!db) throw new Error('D1 binding "DB" introuvable');
  return db as D1Database;
}

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }
  interface D1PreparedStatement {
    bind(...params: any[]): D1PreparedStatement;
    run(): Promise<D1Result>;
    first(): Promise<any | null>;
    all(): Promise<D1Result>;
  }
  interface D1Result {
    success: boolean;
    meta: {
      duration: number;
      last_row_id: number;
      changes: number;
      served_by: string;
      internal_stats: string;
    };
    results: any[];
  }
}
