import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function InfoPage(): JSX.Element {
  return (
    <>
      <h1>
        This is the Info Page. You are seeing this because you are not logged in
        logged in.
      </h1>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <InfoPage />
  </StrictMode>
);
