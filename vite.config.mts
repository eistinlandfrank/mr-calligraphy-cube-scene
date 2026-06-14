import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "app",
  plugins: [react()],
  publicDir: false,
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext"
    }
  },
  esbuild: {
    target: "esnext"
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  build: {
    target: "esnext",
    outDir: "../dist",
    emptyOutDir: true
  }
});
