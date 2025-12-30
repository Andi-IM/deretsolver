# Changelog

## [1.5.5] - 2025-12-30

### Added

- **Testing:** Achieved 100% test coverage for `useRecaptcha` hook.

### Changed

- **Refactoring:** Updated `ResultSection.test.jsx` to use real i18n instance instead of mocks for more robust testing.

## [1.5.4] - 2025-12-30

### Added

- **Testing:** Achieved 100% line coverage for `Layout.jsx` and `ResultSection.jsx`.
- **Testing:** Added 30+ new unit and integration tests.

### Changed

- **Refactoring:** Extracted `InputSection.jsx` into 5 single-responsibility components (`ErrorNotification`, `SequenceInput`, `InputHelperBar`, `ApiKeyInput`, `SolveButton`) following SRP.

## [1.5.3] - 2025-12-30

### Added

- **Testing:** Implemented dependency injection in `FeedbackDialog.jsx` for better testability.
- **Testing:** Added `ThemeToggle.test.jsx` with 3 unit tests.
- **Testing:** Added test for unknown pattern detection in `solver.test.js`.

### Changed

- **Coverage:** Updated thresholds to 97% lines, 95% statements, 94% functions, 89% branches.
- **Refactoring:** Extracted `loadRecaptchaScript` and `submitFeedback` as injectable dependencies.

## [1.5.2] - 2025-12-30

### Added

- **E2E Testing:** Implemented comprehensive localization tests in `e2e/localization.spec.js` to verify language switching and persistence.
- **Localization:** Added missing `hint_title` and `hint_message` translations for English and Indonesian.

### Fixed

- **Tests:** Added unit test to cover `useTheme` error case in `ThemeContext.jsx`.

### Changed

- **Refactoring:** Refactored `ResultSection.jsx` to use semantic CSS variables and removed hardcoded translation fallbacks.

## [1.5.1] - 2025-12-30

### Fixed

- **Lint:** Removed unused imports in `DocumentationPage.jsx` and `QuizMode.jsx`.
- **Tests:** Updated `QuizMode.test.jsx` to match improved UI structure.

### Changed

- **QuizMode:** Refactored difficulty selector logic for better maintainability and removed hacky code.
- **Hygiene:** Applied project-wide formatting using Prettier.

## [1.5.0] - 2025-12-30

### Added

- **Dark Mode Support:** Full theme switching capabilities with state persistence and system preference detection.
- **Theme Toggle:** Added a Sun/Moon toggle component in the header.
- **E2E Testing:** Implemented Playwright tests for dark mode (toggling, persistence, system sync).
- **CI/CD Integration:** Created a new GitHub Actions workflow for automated E2E testing on PRs and pushes.

### Fixed

- **Layout:** Restored missing Layout component in the main App routing.
- **Visuals:** Fixed and restored SVG markers and arrowheads in the sequence visualizer.

### Maintenance

- Added unit tests for ThemeContext logic.
- Configured global matchMedia mock for the test environment.

## [1.4.0] - 2025-12-30

### Added

- Achieved > 90% code coverage with over 200 unit tests.
- Comprehensive unit tests for `useSolver` hook, `firebase` utility, and `logger` utility.
- Added dependency injection patterns to `firebase.js` and `logger.js` for better testability.
- New `useReducer` pattern in `useSolver` hook for predictable state management.

### Fixed

- Fixed initialization order bug in `QuizMode.jsx`.
- Refactored unit tests to avoid hydration errors and mock dependencies correctly.

### Changed

- Improved `useSolver` testability by extracting logic into pure functions.

## [1.3.1] - 2025-12-28

### Removed

- Removed Firebase Functions implementation (initialization, exports, and related tests) as it is no longer used.

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-12-28

### Added

- **Local Solver:** Added support for **Prime Number** sequences (`detectPrimes`).
- **Local Solver:** Added support for **Factorial** sequences (`detectFactorials`).
- **Tests:** Added unit tests for new local solver patterns.

## [1.2.0] - 2025-12-28

### Added

- **Local Pre-Validation:** Added regex check to `geminiSolver.js` to ensure at least 3 valid numbers are present before making API calls.
- **Security:** Migrated `geminiSolver` to use Firebase Cloud Functions proxy when no user API key is provided.
- **Security:** Removed insecure API key fallback from client-side bundle.
- **Tests:** Added unit test for pre-validation logic and cloud proxy fallback.

## [1.1.0] - 2025-12-28

### Added

- **Timeout Logic:** Implemented 3000ms hard timeout in `geminiSolver.js` using `AbortController` to prevent hanging API requests.
- **Validation Report:** Added `docs/VALIDATION_REPORT.md` analyzing the "Strategic Blueprint" against the current codebase.
- **Next Iteration Plan:** Added `docs/NEXT_ITERATION_PLAN.md` outlining the roadmap for the next sprint.
- **Tests:** Added unit tests for timeout logic in `geminiSolver.test.js`.

### Fixed

- Addressed potential cost/latency risks by enforcing client-side cancellation.

## [1.0.0] - 2025-12-26

### Added

- Initial project setup with Vite + React.
- Basic Solver and Documentation pages.
- Gemini AI integration for sequence solving (`gemini-2.5-flash`).
- Firebase integration (Analytics, Logging).
- Internationalization (i18n) support.
