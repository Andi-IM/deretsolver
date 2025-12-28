# Test Coverage Report

## Overview

This document summarizes the current test coverage status for the Deret Solver project.

### Summary Metrics

| Type           | Status    | Passed | Failed | Total    |
| -------------- | --------- | ------ | ------ | -------- |
| **Unit Tests** | ✅ PASSED | 70     | 0      | 70       |
| **E2E Tests**  | ⚠️ VARIES | 65     | 6      | 71       |
| **Linting**    | ✅ PASSED | -      | -      | 38 files |

## Unit Tests

Run via `vitest`. Covers individual components, utilities, and hooks.

### Coverage

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

_(Note: Exact percentages require full report generation which is currently pending E2E resolution)_

## End-to-End (E2E) Tests

Run via `playwright`. Covers user flows, navigation, privacy policy, and critical path solving.

### Known Issues

There are currently **6 failing tests** in the E2E suite, likely related to recent sanitization changes affecting DOM rendering expectations in `ResultSection`.

- `ResultSection E2E`: Rendering of visual elements.
- `DocumentationPage`: Content verification.
- `FeedbackDialog`: Form submission flow.

## How to Run Tests

### Unit Tests

```bash
npm run test
# With coverage
npm run test -- --coverage
```

### E2E Tests

```bash
npm run test:e2e
# With coverage
npm run coverage:e2e
```

### Linting

```bash
npm run lint
```
