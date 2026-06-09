import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db.server";
import { verifyPassword, signJWT, serializeSessionCookie } from "@/server/auth.server";
import { LoginSchema } from "@/server/validation.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const parsed = LoginSchema.safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: "Email ou mot de passe invalide." },
              { status: 400 }
            );
          }

          const db = getDB();

          try {
            const admin = await db
              .prepare("SELECT id, email, password_hash, role FROM admins WHERE email = ?1")
              .bind(parsed.data.email)
              .first();

            if (!admin) {
              return Response.json(
                { error: "Email ou mot de passe incorrect." },
                { status: 401 }
              );
            }

            const passwordMatch = await verifyPassword(
              parsed.data.password,
              admin.password_hash
            );

            if (!passwordMatch) {
              return Response.json(
                { error: "Email ou mot de passe incorrect." },
                { status: 401 }
              );
            }

            const jwtSecret = (globalThis as any).JWT_SECRET;
            const token = await signJWT(
              { id: admin.id, email: admin.email, role: admin.role },
              jwtSecret
            );

            return Response.json(
              { ok: true, email: admin.email, role: admin.role },
              {
                status: 200,
                headers: {
                  "Set-Cookie": serializeSessionCookie(token),
                },
              }
            );
          } catch (e: any) {
            console.error("DB error:", e);
            return Response.json(
              { error: "Erreur serveur." },
              { status: 500 }
            );
          }
        } catch (e) {
          console.error("Login error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
