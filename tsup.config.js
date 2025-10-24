// tsup.config.js
export default {
  entry: ["src/index.jsx"],
  format: ["esm", "cjs"],
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  dts: false,

  external: [
    "react",
    "react-dom",
    "@mui/material",
    "@mui/x-date-pickers",
    "@radix-ui/react-label",
    "@radix-ui/react-popover",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@emotion/react",
    "@emotion/styled",
    "@heroicons/react",
    "react-day-picker",
    "react-hot-toast",
    "react-select",
    "dayjs",
    "dompurify",
    "js-cookie",
    "lucide-react",
  ],

  jsx: "automatic",
  esbuildOptions: (options) => {
    options.jsx = "automatic";
    options.jsxImportSource = "react";
  },
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
};
