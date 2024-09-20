import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

interface HomePageData {
  data: {
    username: string;
  };
}

function HomePage({ data }: HomePageData): JSX.Element {
  return (
    <>
      <h1>
        This is the Home Page. You are seeing this because you are logged in.
        Hello, {data.username}
      </h1>
    </>
  );
}

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

createRoot(rootElement).render(
  <StrictMode>
    <HomePage data={data} />
  </StrictMode>
);
