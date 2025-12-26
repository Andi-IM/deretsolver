import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/material-symbols-outlined';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './i18n';

createRoot(document.getElementById('root')).render(
  <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
    <HelmetProvider>
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    </HelmetProvider>
  </GoogleReCaptchaProvider>,
);
