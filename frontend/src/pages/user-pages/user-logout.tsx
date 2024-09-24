import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../../globals.css";

function LogoutPage(): JSX.Element {
    return (
        <>
            <h1>This is the Logout Page.</h1>
        </>
    );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
    <StrictMode>
        <LogoutPage />
    </StrictMode>
);
