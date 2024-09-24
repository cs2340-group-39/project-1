import { ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Map from "../components/blocks/map";

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
            <h1>This is the Dashboard Page.</h1>
            <p>Hello {data.username}</p>
            <Map apiKey={data.apiKey}></Map>
        </>
    );
}

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

createRoot(rootElement).render(
    <StrictMode>
        <DashboardPage data={data} />
    </StrictMode>
);
