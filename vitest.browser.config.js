import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'GOOGLE_AI_APIKEY'],
  test: {
    globals: true,
    // Browser mode often requires no 'setupFiles' if they rely on Node/JSDOM
    // setupFiles: './src/test/setup.js',
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },

    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
  },
});
