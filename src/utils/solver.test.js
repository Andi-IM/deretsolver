import { describe, expect, it } from 'vitest';

import solveSequence from '@/utils/solver';

describe('solveSequence', () => {
  it('solves geometric sequence 2,4,8,16 -> 32', () => {
    const result = solveSequence('2,4,8,16');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBe(32);
  });

  it('solves interleaved sequence 1,10,2,9 -> [3, 8]', () => {
    const result = solveSequence('1,10,2,9');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    // For interleaved, 'next' might be the immediate next number (3)
    // but predictions will have both [3, 8]
    expect(result.next).toBe(3);
    expect(result.predictions).toEqual([3, 8]);
  });

  it('solves interleaved sequence properly with parsing', () => {
    // Testing the parsing robustness as well similar to the E2E requirement
    const result = solveSequence('1, 10, 2, 9, ..., ...');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.predictions).toEqual([3, 8]);
  });

  // 1. Arithmetic - Addition
  it('solves arithmetic addition 2, 4, 6, 8 -> 10', () => {
    const result = solveSequence('2, 4, 6, 8');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(10);
  });

  // 2. Arithmetic - Subtraction
  it('solves arithmetic subtraction 20, 15, 10, 5 -> 0', () => {
    const result = solveSequence('20, 15, 10, 5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression'); // Type string might vary, but solver.js uses 'Arithmetic Progression'
    expect(result.next).toBe(0);
  });

  // 3. Geometric - Multiplication
  it('solves geometric multiplication 3, 9, 27, 81 -> 243', () => {
    const result = solveSequence('3, 9, 27, 81');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBe(243);
  });

  // 4. Geometric - Division
  it('solves geometric division 100, 50, 25, 12.5 -> 6.25', () => {
    const result = solveSequence('100, 50, 25, 12.5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBe(6.25);
  });

  // 5. Fibonacci
  it('solves fibonacci 1, 1, 2, 3, 5, 8 -> 13', () => {
    const result = solveSequence('1, 1, 2, 3, 5, 8');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Fibonacci Sequence');
    expect(result.next).toBe(13);
  });

  // 6. Power Series - Squares
  it('solves squares 1, 4, 9, 16, 25 -> 36', () => {
    const result = solveSequence('1, 4, 9, 16, 25');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Perfect Squares');
    expect(result.next).toBe(36);
  });

  // 7. Power Series - Cubes
  // Note: solver.js currently only lists 'Perfect Squares' in the `detectPower` function with `^2` label.
  // It checks `Math.sqrt(n)`. It DOES NOT seem to support Cubes explicitly based on my previous read.
  // I will check if it fails. If solver.js doesn't support it, this test will fail.
  // Wait, I should verify solver.js capability for cubes first.
  // Looking at solver.js from previous turn: `detectPower` only checks `Math.sqrt(n)`.
  // AND `solveSequence` only calls `detectPower`.
  // So 'Cubes' might NOT be supported by the local solver.
  // I will add the test, but I expect it to likely fail if the solver isn't updated.
  // However, I must follow the user request "do test". If it fails, I'll know I need to update the solver.
  it('solves cubes 1, 8, 27, 64 -> 125', () => {
    // This might fail if the solver doesn't support cubes.
    // I'll leave it here as requested.
    const result = solveSequence('1, 8, 27, 64');
    // If not supported, result might be null or error.
    // I will treat it as a requirement.
    if (result && result.error) {
      // If it fails, test fails.
    }
    expect(result).not.toBeNull();
    expect(result.next).toBe(125);
  });

  // 8. Mixed Pattern (Interleaved)
  it('solves mixed/interleaved 2, 5, 4, 7, 6, 9 -> 8', () => {
    // Evens: 2, 4, 6 -> +2 -> Next: 8
    // Odds: 5, 7, 9 -> +2 -> Next: 11
    // Last index is 5 (9), which is odd. Next index is 6 (even). So next is 8.
    const result = solveSequence('2, 5, 4, 7, 6, 9');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(8);
  });

  // 9. Negative Numbers
  it('solves negative arithmetic -10, -5, 0, 5 -> 10', () => {
    const result = solveSequence('-10, -5, 0, 5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(10);
  });

  // 10. Decimals
  it('solves decimals 1.5, 3.0, 4.5, 6.0 -> 7.5', () => {
    const result = solveSequence('1.5, 3.0, 4.5, 6.0');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(7.5);
  });
});
