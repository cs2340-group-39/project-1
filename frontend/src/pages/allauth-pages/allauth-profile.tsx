import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ChangeEmailForm } from "../../components/blocks/change-email-form";
import ProfileNavbar from "../../components/blocks/profile-navbar";
import { ThemeProvider } from "../../components/theme-provider";
import { AuroraBackground } from "../../components/ui/aurora-background";
import "../../globals.css";
import ToasterLayout from "../../layouts/toaster-layout";

function ProfilePage(): JSX.Element {
  return (
    <>
      <AuroraBackground>
        <ProfileNavbar className="top-2" />
        <ChangeEmailForm />
      </AuroraBackground>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToasterLayout>
        <ProfilePage />
      </ToasterLayout>
    </ThemeProvider>
  </StrictMode>
);
