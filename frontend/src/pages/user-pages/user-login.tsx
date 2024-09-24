import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "../../components/theme-provider";
import "../../globals.css";

function LoginPage(): JSX.Element {
    return (
        <>
            <h1>This is the Login Page.</h1>
        </>
    );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <LoginPage />
        </ThemeProvider>
    </StrictMode>
);
