import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@app/ui/components/theme-provider";
import "@app/ui/styles.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
