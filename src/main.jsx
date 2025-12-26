import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "material-symbols/outlined.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

createRoot(document.getElementById("root")).render(
  <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </GoogleReCaptchaProvider>
);
