import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@app/ui/styles.css";
import { AppProviders } from "./app/AppProviders.tsx";
import "./app/styles.css";
import App from "./app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
