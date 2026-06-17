import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db.server";
import { SubscribeSchema } from "@/server/validation.server";

export const Route = createFileRoute("/api/newsletter/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const parsed = SubscribeSchema.safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: "Email invalide." },
              { status: 400 }
            );
          }

          const db = getDB();
          const id = crypto.randomUUID();

          try {
            await db
              .prepare(
                "INSERT INTO newsletter_subscribers (id, email) VALUES (?1, ?2)"
              )
              .bind(id, parsed.data.email)
              .run();

            return Response.json({ ok: true });
          } catch (e: any) {
            const msg = String(e?.message || "");
            if (msg.includes("UNIQUE")) {
              return Response.json(
                { error: "Cet email est déjà inscrit." },
                { status: 409 }
              );
            }
            console.error("DB error:", e);
            return Response.json(
              { error: "Erreur serveur." },
              { status: 500 }
            );
          }
        } catch (e) {
          console.error("Subscribe error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
