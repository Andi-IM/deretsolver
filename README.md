[![CodeQL](https://github.com/Andi-IM/deretsolver/actions/workflows/codeql.yml/badge.svg)](https://github.com/Andi-IM/deretsolver/actions/workflows/codeql.yml)
[![Deploy to Firebase Hosting on merge](https://github.com/Andi-IM/deretsolver/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/Andi-IM/deretsolver/actions/workflows/firebase-hosting-merge.yml)

# Deret Solver (v1.4.0)

**Deret Solver** is an intelligent number sequence solver that combines local pattern detection with AI-powered analysis. It helps users identify, visualize, and understand various types of number sequences including arithmetic, geometric, Fibonacci, interleaved patterns, and more complex logic-based sequences.

## 🚀 Overview

Deret Solver uses a dual-solver approach to handle both simple and complex number sequences:

- **Local Solver**: Fast, offline detection of common patterns (arithmetic, geometric, Fibonacci, primes, factorials, etc.).
- **Gemini AI Solver**: AI-powered analysis for complex, abstract, and logic-based sequences using Google's Gemini API (`gemini-2.0-flash`).

Built with **React 19** and **Vite 7** for cutting-edge performance and developer experience.

## ✨ Features

- **Dual Solver System**:
  - **Local Solver**: Instantly solves Arithmetic, Geometric, Fibonacci, Two-Level Difference, Power, **Prime Numbers**, **Factorials**, and **Interleaved Sequences**.
  - **Gemini AI Solver**: Handles complex and logic-based sequences with AI assistance.
- **Quiz Mode**: Test your skills! Generate sequence questions, choose the right answer, and track your progress.
- **Internationalization (i18n)**: Full support for **English** and **Indonesian** languages.
- **Advanced Visualization**:
  - Dynamic **SVG-based visualization** with arcs for interleaved sequences and straight connections for standard patterns.
  - Interactive nodes representing sequence elements and their logical connections.
- **Responsive Design**: Modern, glassmorphic UI built with **Tailwind CSS v4**.
- **Privacy First**: Local analysis when possible, with optional AI processing and secure API handling.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & Material Symbols
- **AI Engine**: [Google Gemini AI API](https://ai.google.dev/)
- **State/Routing**: React Context, React Router 7
- **Localization**: i18next
- **Backend/Hosting**: Firebase (Hosting, Analytics)

## 🧪 Testing & Quality

The project maintains high standards with a comprehensive testing suite:

- **Unit Testing**: [Vitest](https://vitest.dev/) for logic and component testing.
- **E2E Testing**: [Playwright](https://playwright.dev/) for full-flow browser testing.
- **Linting**: [Oxlint](https://oxlint.js.org/) for high-performance linting.
- **Formatting**: [Prettier](https://prettier.io/).

### Commands

```bash
# Run development server
npm run dev

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Generate E2E coverage report
npm run coverage:e2e

# Build for production
npm run build
```

## 📝 Logging & Monitoring

Includes a custom logger utility and Firebase Analytics integration to monitor application health and solver performance while respecting user privacy.

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
