import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CedulasApp from "./CedulasApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CedulasApp />
  </StrictMode>,
);
