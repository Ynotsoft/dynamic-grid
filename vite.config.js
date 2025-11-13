import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    lib: {
      entry: resolve("src/index.jsx"),
      name: "YNOTSoft Dynamic Grid",
      formats: ["es", "umd"],
      fileName: (format) =>
        format === "umd" ? "dynamic-grid.umd.cjs" : "dynamic-grid.js",
      cssFileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-hot-toast",
        "dayjs",
        "react-select",
        "react-day-picker",
      ],
      output: {
        exports: "named",
        assetFileNames: (assetInfo) =>
          assetInfo.fileName?.endsWith(".css")
            ? "index.css"
            : "[name][extname]",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime", // 👈 add this
          "react-hot-toast": "reactHotToast",
          dayjs: "dayjs",
          "react-select": "ReactSelect",
          "react-day-picker": "ReactDayPicker",
        },
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: "dist",
  },
});
