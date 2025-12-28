# Test Cases

## Overview

This document outlines the test cases for the Deret Solver application, covering core functionality including sequence solving, user feedback, navigation, and internationalization.

### Format Legend

- **ID**: Unique identifier (e.g., TC_SOLVER_001)
- **Status**: Pass / Fail / Blocked / Skipped (Current status based on latest E2E run)

---

## 1. Solver Functionality

### TC_SOLVER_001

- **Test Case Title**: Verify Arithmetic Progression Solution
- **Objective/Description**: Ensure the solver correctly identifies and solves a simple arithmetic sequence.
- **Preconditions**: User is on the homepage. Input field is visible.
- **Test Steps**:
  1. Open the application URL.
  2. Locate the input sequence textarea.
  3. Enter "2, 4, 6, 8".
  4. Click the "Solve" button.
- **Test Data**: Sequence: `2, 4, 6, 8`
- **Expected Result**:
  - Result section appears.
  - Pattern Type shows "Arithmetic".
  - Predicted Next Number is "10".
- **Actual Result**: Result section displayed, Type: Arithmetic, Next: 10.
- **Status**: Pass
- **Post-conditions**: Result visualizations are displayed.

### TC_SOLVER_003

- **Test Case Title**: Verify Geometric Progression Solution
- **Objective/Description**: Ensure the solver correctly identifies and solves a geometric sequence.
- **Preconditions**: User is on the homepage.
- **Test Steps**:
  1. Open the application URL.
  2. Enter "2, 4, 8, 16" into the input field.
  3. Click "Solve".
- **Test Data**: Sequence: `2, 4, 8, 16`
- **Expected Result**:
  - Result section appears.
  - Pattern Type shows "Geometric".
  - Rule shows "Multiply by 2" (or x2).
  - Predicted Next Number is "32".
- **Actual Result**: Result displayed, Type: Geometric, Rule: x2, Next: 32.
- **Status**: Pass
- **Post-conditions**: None.

### TC_SOLVER_005

- **Test Case Title**: Verify Interleaved Sequence Solution
- **Objective/Description**: Ensure the solver correctly handles complex interleaved sequences which return multiple predictions.
- **Preconditions**: User is on the homepage.
- **Test Steps**:
  1. Open the application URL.
  2. Enter "1, 10, 2, 20, 3, 30" into the input field.
  3. Click "Solve".
- **Test Data**: Sequence: `1, 10, 2, 20, 3, 30`
- **Expected Result**:
  - Solver identifies "Interleaved" pattern.
  - Returns two predicted numbers (next for odd position, next for even position).
- **Actual Result**: Identified Interleaved, predictions displayed.
- **Status**: Pass
- **Post-conditions**: None.

---

## 2. Feedback System

### TC_FEEDBACK_001

- **Test Case Title**: Verify Positive Feedback Submission
- **Objective/Description**: Ensure users can submit "Helpful" feedback after a solution.
- **Preconditions**: A sequence has been solved and the feedback dialog/prompt is visible.
- **Test Steps**:
  1. Solve any valid sequence (e.g., 2, 4, 6).
  2. Locate the Feedback section.
  3. Click "Yes" or "Helpful".
- **Test Data**: Input: `2, 4, 6`
- **Expected Result**:
  - Feedback dialog closes or shows a "Thank You" message.
  - Feedback is recorded in the database (verified via mocks/logs).
- **Actual Result**: "Thank You" message displayed.
- **Status**: Pass
- **Post-conditions**: Feedback form is reset/hidden.

### TC_FEEDBACK_002

- **Test Case Title**: Verify Negative Feedback Form Display
- **Objective/Description**: Ensure the detailed feedback form appears when a user clicks "Not Helpful".
- **Preconditions**: A sequence has been solved.
- **Test Steps**:
  1. Solve any sequence.
  2. Click "No" or "Not Helpful".
- **Test Data**: None.
- **Expected Result**:
  - A form appears asking for "Reason" and "Comment".
  - "Incorrect" and "Unclear" options are visible.
- **Actual Result**: Form displayed correctly.
- **Status**: Pass
- **Post-conditions**: Form is open waiting for input.

### TC_FEEDBACK_003

- **Test Case Title**: Submit Negative Feedback with Comment
- **Objective/Description**: Verify submission of negative feedback with a specific reason and comment.
- **Preconditions**: Negative feedback form is open (see TC_FEEDBACK_002).
- **Test Steps**:
  1. Select reason "Incorrect Result".
  2. Type "This is a test comment" in the comment box.
  3. Click "Submit".
- **Test Data**: Reason: `Incorrect`, Comment: `This is a test comment`
- **Expected Result**:
  - Form submits successfully.
  - "Thank You" message appears.
- **Actual Result**: Submission successful.
- **Status**: Pass
- **Post-conditions**: Data stored in Firestore.

---

## 3. Navigation & Localization

### TC_NAV_001

- **Test Case Title**: Navigate to Documentation
- **Objective/Description**: Verify navigation from Home to Documentation page.
- **Preconditions**: User is on Home page.
- **Test Steps**:
  1. Locate the navigation menu.
  2. Click "Documentation".
- **Test Data**: Link: `/docs`
- **Expected Result**:
  - URL changes to `/docs`.
  - Documentation page content (e.g., "How to Use") is visible.
- **Actual Result**: Navigated to /docs successfully.
- **Status**: Pass
- **Post-conditions**: User is on Documentation page.

### TC_NAV_002

- **Test Case Title**: Language Switching (EN -> ID)
- **Objective/Description**: Verify that switching language to Indonesian updates the UI text.
- **Preconditions**: User is on Home page (English default).
- **Test Steps**:
  1. Click the Language Switcher (globe icon/text).
  2. Select "Bahasa Indonesia" (ID).
- **Test Data**: Locale: `id`
- **Expected Result**:
  - UI text updates to Indonesian (e.g., "Solver" -> "Pemecah", "Pattern" -> "Pola").
- **Actual Result**: Text updated to Indonesian.
- **Status**: Pass
- **Post-conditions**: Locale remains set to ID.

### TC_NAV_003

- **Test Case Title**: Navigate to Privacy Policy
- **Objective/Description**: Verify access to the Privacy Policy page from the footer.
- **Preconditions**: User is on any page.
- **Test Steps**:
  1. Scroll to the footer.
  2. Click "Privacy Policy".
- **Test Data**: Link: `/privacy`
- **Expected Result**:
  - URL changes to `/privacy`.
  - Privacy Policy title and content are displayed.
- **Actual Result**: Navigated to Privacy Policy.
- **Status**: Pass
- **Post-conditions**: User is on Privacy Policy page.
