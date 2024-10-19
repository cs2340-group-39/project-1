import axios from "axios";
import { ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import DashboardDock from "../components/blocks/dashboard-dock";
import Maps from "../components/blocks/maps";
import { ThemeProvider } from "../components/theme-provider";
import "../globals.css";

interface DashboardData {
  data: {
    username: string;
    googleMapsApiKey: string;
    mapBoxAccessToken: string;
  };
}

function DashboardPage({ data }: DashboardData): ReactElement {
  // @ts-ignore
  const handleLogout = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/_allauth/browser/v1/auth/session"); // Lol this request throws a 401 every time so redirection must happen in catch block.
    } catch (error) {
      window.location.replace("/users/accounts/login/");
    }
  };

  return (
    <>
      <div className="overflow-hidden">
        <Maps mapBoxAccessToken={data.mapBoxAccessToken} />
      </div>
      <DashboardDock />
    </>
  );
}

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <DashboardPage data={data} />
    </ThemeProvider>
  </StrictMode>
);
