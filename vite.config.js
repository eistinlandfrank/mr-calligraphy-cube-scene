import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "preview-route-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) {
            next();
            return;
          }

          const [path, query = ""] = req.url.split("?");
          const suffix = query ? `?${query}` : "";

          if (path === "/demo") {
            req.url = `/demo/${suffix}`;
          }

          if (path === "/admin") {
            req.url = `/admin/${suffix}`;
          }

          if (path === "/preview" || path.startsWith("/preview/")) {
            req.url = `/preview/${suffix}`;
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
