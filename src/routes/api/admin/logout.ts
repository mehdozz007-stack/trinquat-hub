import { createFileRoute } from "@tanstack/react-router";
import { serializeLogoutCookie } from "@/server/auth.server";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json(
          { ok: true },
          {
            status: 200,
            headers: {
              "Set-Cookie": serializeLogoutCookie(),
            },
          }
        );
      },
    },
  },
});
