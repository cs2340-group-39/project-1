import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LoginForm } from "../../components/blocks/login-form";
import { ThemeProvider } from "../../components/theme-provider";
import { AuroraBackground } from "../../components/ui/aurora-background";
import "../../globals.css";

function LoginPage(): JSX.Element {
    return (
        <>
            <AuroraBackground>
                <LoginForm />
            </AuroraBackground>
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
