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
        dashboard: resolve(__dirname, "src/pages/dashboard.tsx"),
        info: resolve(__dirname, "src/pages/info.tsx"),
        allauthLogin: resolve(
          __dirname,
          "src/pages/allauth-pages/allauth-login.tsx"
        ),
        allauthLogout: resolve(
          __dirname,
          "src/pages/allauth-pages/allauth-logout.tsx"
        ),
        allauthSignup: resolve(
          __dirname,
          "src/pages/allauth-pages/allauth-signup.tsx"
        ),
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
