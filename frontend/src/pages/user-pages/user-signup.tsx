import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SignupForm } from "../../components/blocks/signup-form";
import { ThemeProvider } from "../../components/theme-provider";
import { AuroraBackground } from "../../components/ui/aurora-background";
import "../../globals.css";

function SignupPage(): JSX.Element {
  return (
    <>
      <AuroraBackground>
        <SignupForm className="max-h-[75vh] overflow-y-scroll bg-white/75 dark:bg-black/75 rounded-2xl backdrop-blur-2xl" />
      </AuroraBackground>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SignupPage />
    </ThemeProvider>
  </StrictMode>
);
