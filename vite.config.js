import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'GOOGLE_AI_APIKEY'],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.browser.test.*'],
  },
  build: {
    target: 'es2017',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async', 'react-i18next'],
          zod: ['zod', 'zod-to-json-schema'],
          material: ['@fontsource/material-symbols-outlined', 'lucide-react'],
          firebase: ['firebase', '@google/genai'],
        },
      },
    },
  },
});
