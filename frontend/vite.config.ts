import react from "@vitejs/plugin-react-swc";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/static/app", // Output to Django's static files directory
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, "src/pages/home.tsx"),
        info: resolve(__dirname, "src/pages/info.tsx"),
        maps: resolve(__dirname, "src/pages/maps.tsx"),
      },
      output: {
        entryFileNames: "[name].bundle.js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
