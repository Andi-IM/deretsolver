# Local Solver: Complexity Hierarchy & Priority

This document outlines the priority logic used by `solver.js` to detect number patterns. The solver follows an **Occam's Razor** approach: it attempts to find the simplest explanation (pattern) first before testing for more complex or specific relationships.

## Solving Priority (Execution Order)

The patterns are checked in the following strict order. The **first** pattern that matches is returned as the result.

| Priority | Pattern Type | Complexity | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Arithmetic** | Low | Constant difference between terms. | `2, 4, 6, 8` (+2) |
| **2** | **Geometric** | Low | Constant ratio between terms. | `3, 9, 27, 81` (x3) |
| **3** | **Power / Perfect Roots** | Medium | Numbers are perfect squares ($n^2$) or cubes ($n^3$). Checked early because they can sometimes mimic 2-level sequences. | `1, 4, 9, 16` |
| **4** | **Fibonacci** | Medium | Each number is the sum of the two preceding ones. | `1, 1, 2, 3, 5` |
| **5** | **Prime Numbers** | Medium | Sequence of consecutive prime numbers. | `2, 3, 5, 7, 11` |
| **6** | **Factorials** | Medium | Sequence of factorials ($n!$). | `1, 2, 6, 24` |
| **7** | **Two-Level Difference** | High | The differences between numbers form an Arithmetic sequence. | `1, 2, 4, 7, 11` (Diffs: 1, 2, 3, 4) |
| **8** | **Interleaved** | Very High | Two independent sequences alternating (e.g., Odd positions = Arithmetic, Even positions = Geometric). | `1, 10, 2, 20, 3` |

---

## Complexity Ranking

### Level 1: Linear / Single-Step Rules (Simple)
These are the most fundamental patterns. They require only one level of calculation to verify.
- **Arithmetic**: $a_n = a_{n-1} + d$
- **Geometric**: $a_n = a_{n-1} \times r$

### Level 2: Specific Known Sequences (Moderate)
These rely on specific mathematical properties rather than generic differences.
- **Powers**: $n^2, n^3$
- **Fibonacci**: $a_n = a_{n-1} + a_{n-2}$
- **Primes**: $P_n$
- **Factorials**: $n!$

### Level 3: Recursive / Multi-Step Rules (Complex)
These require analyzing the *meta-data* of the sequence (differences of differences) or splitting the sequence.
- **Two-Level**: Requires calculating differences, then checking those differences for an Arithmetic pattern.
- **Interleaved**: Requires splitting the array into even/odd indices and recursively solving both.

## Why This Priority Matters

1.  **Efficiency**: The fastest checks (Arithmetic/Geometric) are done first (O(N)). Recursive checks (Interleaved) are done last.
2.  **Specificity**: 
    - A **Perfect Square** sequence like `1, 4, 9, 16` *technically* also has a constant second difference (Level 2).
    - Checks: Diffs `3, 5, 7` -> Diffs2 `2, 2`.
    - If we checked "Two-Level" before "Power", it would be identified as "2-Level Arithmetic". While correct, "Perfect Squares" is a **more specific and useful** description for the user. Thus, `detectPower` runs before `detectTwoLevel`.
3.  **Ambiguity Resolution**:
    - `1, 2, 3` is both Arithmetic (diff 1), Fibonacci-like (1+2=3), and Primes (2,3... wait 1 is not prime).
    - By prioritizing Arithmetic, we give the simplest description: "Add 1".
