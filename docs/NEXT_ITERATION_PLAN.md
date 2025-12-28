# Next Iteration Solution Plan

Based on the [Strategic Blueprint Validation Report](./VALIDATION_REPORT.md), the following actionable tasks have been prioritized for the immediate next iteration.

## 1. Technical stability & Cost Control (Priority: High)

- **Implement Timeout Logic:** Add `AbortController` to `geminiSolver.js` with a hard 3000ms timeout. Ensure the request is cancelled client-side to free up UI resources.
- **Local Pre-Validation:** Add a regex check in `geminiSolver.js` to ensure input contains at least 3 valid numbers before triggering any API call, reducing "junk" query costs.
- **Security:** Verify API Key security. If currently exposed in client bundle, migrate the actual call to a **Firebase Cloud Function** (using the existing `firebase.json` setup) to act as a proxy.

## 2. Feature Gaps (Priority: Medium)

- **Expand Local Solver:** Update `solver.js` to include logic for:
  - **Prime Number Sequences** (e.g., 2, 3, 5, 7, 11) - _Critical for "Hard" difficulty._
  - **Factorial Sequences** (e.g., 1, 2, 6, 24) - _Distinct pattern type._

## 3. UX Improvments (Priority: Medium)

- **Optimistic UI Correction:** Modify `ResultSection.jsx` to show optimistic predictions in a "Ghost State" (50% opacity, potentially with a question mark) until verified, to reduce cognitive dissonance if the prediction changes.
- **Error State "Hint Overlay":** If no pattern is found, instead of a blank slate, display "Ghost Arcs" or highlight the differences (Diff 1, Diff 2) to help the user manually spot patterns (Cognitive Offloading).
- **"Buy Pro" Waitlist:** Add a simple modal to the "Buy Pro" button to collect emails ("Notify Me") instead of doing nothing, mitigating user churn/trust issues.
