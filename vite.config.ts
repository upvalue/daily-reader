import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

const port = Number(process.env.VITE_PORT ?? 5173);
const apiPort = Number(process.env.API_PORT ?? 3001);
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  root: "src/client",
  base: basePath,
  plugins: [
    TanStackRouterVite({
      routesDirectory: path.resolve(__dirname, "src/client/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/client/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port,
    proxy: {
      [`${basePath}api`]: {
        target: `http://localhost:${apiPort}`,
        rewrite: (p) => p.replace(new RegExp(`^${basePath}`), "/"),
      },
    },
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true,
  },
});
