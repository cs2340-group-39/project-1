import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function MapsPage(): JSX.Element {
  return (
    <>
      <h1>This is the Maps Page.</h1>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <MapsPage />
  </StrictMode>
);
