import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

let assetBase = import.meta.env.BASE_URL;
if (!assetBase.endsWith("/")) assetBase += "/";
document.documentElement.style.setProperty("--quiz-bg-image", `url("${assetBase}quiz-bg.png")`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
