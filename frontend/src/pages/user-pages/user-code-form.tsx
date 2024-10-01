import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CodeForm } from "../../components/blocks/code-form";
import { ThemeProvider } from "../../components/theme-provider";
import { AuroraBackground } from "../../components/ui/aurora-background";
import "../../globals.css";

function CodeFormPage(): JSX.Element {
    return (
        <>
            <AuroraBackground>
                <CodeForm />
            </AuroraBackground>
        </>
    );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <CodeFormPage />
        </ThemeProvider>
    </StrictMode>
);
