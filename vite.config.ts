import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    tsConfigPaths(),
  ],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ["@tanstack/react-start"],
  },
  ssr: {
    external: ["@tanstack/react-start"],
  },
});
