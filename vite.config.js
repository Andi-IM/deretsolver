import { codecovVitePlugin } from '@codecov/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      // Only instrument code when running E2E coverage
      istanbul({
        include: 'src/*',
        exclude: ['node_modules', 'test/', 'e2e/'],
        extension: ['.js', '.jsx'],
        requireEnv: true, // Only instrument when VITE_COVERAGE=true
      }),
      codecovVitePlugin({
        enableBundleAnalysis: env.CODECOV_TOKEN !== undefined,
        bundleName: 'deretsolver',
        uploadToken: env.CODECOV_TOKEN,
        gitService: 'github',
      }),
    ],
    envPrefix: ['VITE_', 'GOOGLE_AI_APIKEY'],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/functions/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'json'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/test/**', 'src/**/*.test.{js,jsx}', 'src/main.jsx', 'src/i18n.js'],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    build: {
      target: 'es2017',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: [
              'react',
              'react-dom',
              'react-router-dom',
              'react-helmet-async',
              'react-i18next',
            ],
            zod: ['zod', 'zod-to-json-schema'],
            material: ['@fontsource/material-symbols-outlined', 'lucide-react'],
            firebase: ['firebase', '@google/genai'],
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['functions'], // Prevent checking backend deps
    },
  };
});
