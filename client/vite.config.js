import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // This provides a global safety fallback for third-party scripts expecting Node environments
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
    },
    "global.process": {
      env: {
        NODE_ENV: JSON.stringify("production"),
      },
    },
  },
});
