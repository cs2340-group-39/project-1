import { ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../globals.css";

function DashboardPage(): ReactElement {
    return (
        <>
            <h1>This is the Home Page.</h1>
        </>
    );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
    <StrictMode>
        <DashboardPage />
    </StrictMode>
);
