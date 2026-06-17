import { createFileRoute } from "@tanstack/react-router";
// Server-only imports - commented out for client-only build
// import { requireAdmin } from "@/server/auth.server";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const jwtSecret = (globalThis as any).JWT_SECRET;
          const session = await requireAdmin(request, jwtSecret);

          return Response.json({
            ok: true,
            id: session.id,
            email: session.email,
            role: session.role,
          });
        } catch (e: any) {
          if (e instanceof Response) {
            return e;
          }
          console.error("Me error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
