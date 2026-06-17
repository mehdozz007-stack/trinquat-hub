import { createFileRoute } from "@tanstack/react-router";
// Server-only imports - commented out for client-only build
// import { getDB } from "@/server/db.server";
// import { requireAdmin } from "@/server/auth.server";

export const Route = createFileRoute("/api/admin/subscribers/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const jwtSecret = (globalThis as any).JWT_SECRET;
          await requireAdmin(request, jwtSecret);

          const db = getDB();

          try {
            const result = await db
              .prepare(
                "SELECT email, is_active, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
              )
              .all();

            const subscribers = result.results || [];

            // En-têtes CSV avec BOM UTF-8
            const headers = ["Email", "Actif", "Date d'inscription"];
            const rows = subscribers.map((sub: any) => [
              sub.email,
              sub.is_active ? "Oui" : "Non",
              new Date(sub.created_at).toLocaleString("fr-FR"),
            ]);

            // Créer le CSV avec BOM
            const bom = "\uFEFF";
            const csv = bom + [headers, ...rows]
              .map((row: any) =>
                row
                  .map((cell: any) => {
                    const str = String(cell || "");
                    return `"${str.replace(/"/g, '""')}"`;
                  })
                  .join(",")
              )
              .join("\n");

            return new Response(csv, {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="newsletter_${new Date().toISOString().split("T")[0]}.csv"`,
              },
            });
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
          console.error("Export error:", e);
          return Response.json(
            { error: "Erreur serveur." },
            { status: 500 }
          );
        }
      },
    },
  },
});
