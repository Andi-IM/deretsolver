[![CodeQL](https://github.com/Andi-IM/deretsolver/actions/workflows/codeql.yml/badge.svg)](https://github.com/Andi-IM/deretsolver/actions/workflows/codeql.yml)
[![Deploy to Firebase Hosting on merge](https://github.com/Andi-IM/deretsolver/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/Andi-IM/deretsolver/actions/workflows/firebase-hosting-merge.yml)

# Deret Solver

**Deret Solver** is an intelligent number sequence solver that combines local pattern detection with AI-powered analysis. It helps users identify, visualize, and understand various types of number sequences including arithmetic, geometric, Fibonacci, interleaved patterns, and more complex sequences.

## Overview

Deret Solver uses a dual-solver approach to handle both simple and complex number sequences:

- **Local Solver**: Fast, offline detection of common patterns (arithmetic, geometric, Fibonacci, etc.)
- **Gemini AI Solver**: AI-powered analysis for complex, abstract, and logic-based sequences using Google's Gemini API

Built with React and Vite for optimal performance and developer experience.

## Features

- **Dual Solver System**:
  - **Local Solver**: Instantly solves Arithmetic, Geometric, Fibonacci, Two-Level Difference, Power, and **Interleaved Sequences** offline.
  - **Gemini AI Solver**: Handles complex, abstract, and logic-based sequences using Google's Gemini API.
- **Advanced Visualization**:
  - Dynamic **SVG-based visualization** with arcs for interleaved sequences and straight lines for standard sequences.
  - Interactive nodes and connections representing the pattern logic.
- **Documentation & Guide**: Built-in guide for usage and supported patterns.
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
