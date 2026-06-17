import { createFileRoute } from "@tanstack/react-router";
// Server-only imports - commented out for client-only build
// import { getDB } from "@/server/db.server";
// import { requireAdmin } from "@/server/auth.server";

export const Route = createFileRoute("/api/admin/subscribers/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const jwtSecret = (globalThis as any).JWT_SECRET;
          await requireAdmin(request, jwtSecret);

          const url = new URL(request.url);
          const q = url.searchParams.get("q") || "";
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
          const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);

          const db = getDB();

          let query = "SELECT id, email, is_active, created_at FROM newsletter_subscribers";
          let countQuery = "SELECT COUNT(*) as total FROM newsletter_subscribers";
          const params: any[] = [];

          if (q) {
            const searchTerm = `%${q}%`;
            query += " WHERE email LIKE ?1";
            countQuery += " WHERE email LIKE ?1";
            params.push(searchTerm);
          }

          query += " ORDER BY created_at DESC LIMIT ?2 OFFSET ?3";

          const countResult = await db
            .prepare(countQuery)
            .bind(...params)
            .first();

          const results = await db
            .prepare(query)
            .bind(...params, limit, offset)
            .all();

          return Response.json({
            ok: true,
            subscribers: results.results || [],
            total: countResult?.total || 0,
            limit,
            offset,
          });
        } catch (e: any) {
          if (e instanceof Response) {
            return e;
          }
          console.error("Subscribers list error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
