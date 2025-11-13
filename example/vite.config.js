import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ["ynotsoft-dynamic-grid"],
    force: true,
  },
  server: {
    fs: {
      allow: [
        ".", // project root
        "..", // parent folder
        "../ynotsoft-dynamic-grid",
      ],
    },
  },
});
