import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db.server";
import { requireAdmin } from "@/server/auth.server";
import { ToggleSubscriberSchema } from "@/server/validation.server";

export const Route = createFileRoute("/api/admin/subscribers/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const jwtSecret = (globalThis as any).JWT_SECRET;
          await requireAdmin(request, jwtSecret);

          const body = await request.json().catch(() => null);
          const parsed = ToggleSubscriberSchema.safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: "Données invalides." },
              { status: 400 }
            );
          }

          const db = getDB();

          try {
            const result = await db
              .prepare("UPDATE newsletter_subscribers SET is_active = ?1 WHERE id = ?2")
              .bind(parsed.data.is_active ? 1 : 0, params.id)
              .run();

            if (result.meta.changes === 0) {
              return Response.json(
                { error: "Abonné non trouvé." },
                { status: 404 }
              );
            }

            return Response.json({ ok: true });
          } catch (e: any) {
            console.error("DB error:", e);
            return Response.json(
              { error: "Erreur serveur." },
              { status: 500 }
            );
          }
        } catch (e: any) {
          if (e instanceof Response) {
            return e;
          }
          console.error("Toggle subscriber error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const jwtSecret = (globalThis as any).JWT_SECRET;
          await requireAdmin(request, jwtSecret);

          const db = getDB();

          try {
            const result = await db
              .prepare("DELETE FROM newsletter_subscribers WHERE id = ?1")
              .bind(params.id)
              .run();

            if (result.meta.changes === 0) {
              return Response.json(
                { error: "Abonné non trouvé." },
                { status: 404 }
              );
            }

            return Response.json({ ok: true });
          } catch (e: any) {
            console.error("DB error:", e);
            return Response.json(
              { error: "Erreur serveur." },
              { status: 500 }
            );
          }
        } catch (e: any) {
          if (e instanceof Response) {
            return e;
          }
          console.error("Delete subscriber error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
