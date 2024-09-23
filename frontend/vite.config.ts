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
                userLogin: resolve(__dirname, "src/pages/user-pages/user-login.tsx"),
                userLogout: resolve(__dirname, "src/pages/user-pages/user-logout.tsx"),
                userSignup: resolve(__dirname, "src/pages/user-pages/user-signup.tsx"),
                userProfile: resolve(__dirname, "src/pages/user-pages/user-profile.tsx"),
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
