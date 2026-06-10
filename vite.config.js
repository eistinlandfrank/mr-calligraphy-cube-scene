import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "preview-route-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/preview/")) {
            req.url = "/preview/";
          }

          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        demo: "demo/index.html",
        admin: "admin/index.html",
        preview: "preview/index.html"
      }
    }
  }
});
