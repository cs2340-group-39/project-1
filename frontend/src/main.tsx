import { StrictMode } from "react";

import ReactDOM from "react-dom";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

ReactDOM.render(
  <StrictMode>
    <App data={data} />
  </StrictMode>,
  rootElement
);
