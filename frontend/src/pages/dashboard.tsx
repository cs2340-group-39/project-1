import { ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

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
    return (
        <>
            <Maps googleMapsApiKey={data.googleMapsApiKey} mapBoxAccessToken={data.mapBoxAccessToken} />
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
