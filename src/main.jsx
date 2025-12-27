import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource/material-symbols-outlined';

import App from '@/App';
import '@/i18n';
import '@/index.css';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </HelmetProvider>,
);
