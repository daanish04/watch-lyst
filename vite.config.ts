import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests from /api to your local backend server
      "/api": {
        target: "http://localhost:4000", // Matches the original backend PORT
        changeOrigin: true,
        // The rewrite rule is important if your backend routes don't expect '/api' prefix
        // Since your backend uses routes like '/api/summarize', we keep the /api prefix.
        rewrite: (path) => path, // No rewrite needed if backend expects /api
      },
    },
  },
  build: {
    outDir: "dist", // Default for Vite, but good to explicitly state for clarity
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
