import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";

import "./styles/index.css";
import { App } from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No encuentro el elemento #root.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
