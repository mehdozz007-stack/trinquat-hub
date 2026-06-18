import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db.server";
import { hashPassword, signJWT, serializeSessionCookie } from "@/server/auth.server";
import { BootstrapSchema } from "@/server/validation.server";

export const Route = createFileRoute("/api/admin/bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Vérifier le token bootstrap depuis les headers
          const bootstrapToken = request.headers.get("x-bootstrap-token");
          const envBootstrapToken = (globalThis as any).ADMIN_BOOTSTRAP_TOKEN;

          if (!bootstrapToken || bootstrapToken !== envBootstrapToken) {
            return Response.json(
              { error: "Token bootstrap invalide." },
              { status: 403 }
            );
          }

          const body = await request.json().catch(() => null);
          const parsed = BootstrapSchema.safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: "Email ou mot de passe invalide." },
              { status: 400 }
            );
          }

          const db = getDB();

          // Vérifier si un admin existe déjà
          const existing = await db
            .prepare("SELECT COUNT(*) as count FROM admins")
            .first();

          if (existing?.count > 0) {
            return Response.json(
              { error: "Un admin existe déjà." },
              { status: 409 }
            );
          }

          const id = crypto.randomUUID();
          const passwordHash = await hashPassword(parsed.data.password);
          const jwtSecret = (globalThis as any).JWT_SECRET;

          try {
            await db
              .prepare(
                "INSERT INTO admins (id, email, password_hash, role) VALUES (?1, ?2, ?3, ?4)"
              )
              .bind(id, parsed.data.email, passwordHash, "superadmin")
              .run();

            const token = await signJWT(
              { id, email: parsed.data.email, role: "superadmin" },
              jwtSecret
            );

            return Response.json(
              { ok: true, message: "Admin créé avec succès." },
              {
                status: 201,
                headers: {
                  "Set-Cookie": serializeSessionCookie(token),
                },
              }
            );
          } catch (e: any) {
            const msg = String(e?.message || "");
            if (msg.includes("UNIQUE")) {
              return Response.json(
                { error: "Cet email est déjà utilisé." },
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
          console.error("Bootstrap error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
