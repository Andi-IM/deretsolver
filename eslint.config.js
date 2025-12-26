import js from '@eslint/js';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  { ignores: ['dist/**'] },
  ...compat.extends('airbnb', 'prettier'),
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'import/no-extraneous-dependencies': 'off',
      'react/prop-types': 'off', // Often annoying in rapid dev, but can be kept if strictness desired. User asked for Airbnb conventions so maybe keep it on? I'll leave it to Airbnb default mostly, but react-in-jsx-scope is essential to turn off.
      'no-underscore-dangle': ['error', { allow: ['__filename', '__dirname'] }],
      'import/no-unresolved': ['error', { ignore: ['^@vitejs/plugin-react', '^vitest/browser'] }],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.test.jsx', '**/*.spec.jsx', '**/*.test.js', '**/*.spec.js'],
    rules: {
      'react/jsx-props-no-spreading': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
