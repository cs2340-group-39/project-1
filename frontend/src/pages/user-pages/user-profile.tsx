import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import { ChangeEmailForm } from "../../components/blocks/change-email-form";
import { ChangePasswordForm } from "../../components/blocks/change-password-form";
import ProfileNavbar from "../../components/blocks/profile-navbar";
import { ThemeProvider } from "../../components/theme-provider";
import { AuroraBackground } from "../../components/ui/aurora-background";
import ToasterLayout from "../../layouts/toaster-layout";

import "../../globals.css";

function ProfilePage(): JSX.Element {
  const [profilePage, setProfilePage] = useState("change-email-form");

  const renderForm = () => {
    switch (profilePage) {
      case "change-email-form":
        return <ChangeEmailForm />;
      case "change-password-form":
        return <ChangePasswordForm />;
      default:
        return null;
    }
  };

  return (
    <>
      <AuroraBackground>
        <ProfileNavbar className="top-2" setProfilePage={setProfilePage} />
        {renderForm()}
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
