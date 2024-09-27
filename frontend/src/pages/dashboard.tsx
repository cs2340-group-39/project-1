import { ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import GoogleMapsSearch from "../components/blocks/google-maps-search";
import { ThemeProvider } from "../components/theme-provider";

import "../globals.css";

interface DashboardData {
    data: {
        username: string;
        apiKey: string;
    };
}

function DashboardPage({ data }: DashboardData): ReactElement {
    return (
        <>
            <GoogleMapsSearch apiKey={data.apiKey}></GoogleMapsSearch>
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
