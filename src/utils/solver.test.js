import { describe, expect, it } from 'vitest';

import solveSequence from '@/utils/solver';

describe('solveSequence', () => {
  // Basic pattern tests
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
    expect(result.next).toBe(3);
    expect(result.predictions).toEqual([3, 8]);
  });

  it('solves interleaved sequence properly with parsing', () => {
    const result = solveSequence('1, 10, 2, 9, ..., ...');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.predictions).toEqual([3, 8]);
  });

  // Arithmetic tests
  it('solves arithmetic addition 2, 4, 6, 8 -> 10', () => {
    const result = solveSequence('2, 4, 6, 8');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(10);
  });

  it('solves arithmetic subtraction 20, 15, 10, 5 -> 0', () => {
    const result = solveSequence('20, 15, 10, 5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(0);
  });

  // Geometric tests
  it('solves geometric multiplication 3, 9, 27, 81 -> 243', () => {
    const result = solveSequence('3, 9, 27, 81');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBe(243);
  });

  it('solves geometric division 100, 50, 25, 12.5 -> 6.25', () => {
    const result = solveSequence('100, 50, 25, 12.5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBe(6.25);
  });

  // Fibonacci
  it('solves fibonacci 1, 1, 2, 3, 5, 8 -> 13', () => {
    const result = solveSequence('1, 1, 2, 3, 5, 8');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Fibonacci Sequence');
    expect(result.next).toBe(13);
  });

  // Power Series
  it('solves squares 1, 4, 9, 16, 25 -> 36', () => {
    const result = solveSequence('1, 4, 9, 16, 25');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Perfect Squares');
    expect(result.next).toBe(36);
  });

  it('solves cubes 1, 8, 27, 64 -> 125', () => {
    const result = solveSequence('1, 8, 27, 64');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Perfect Cubes');
    expect(result.next).toBe(125);
  });

  // Interleaved edge case
  it('solves mixed/interleaved 2, 5, 4, 7, 6, 9 -> 8', () => {
    const result = solveSequence('2, 5, 4, 7, 6, 9');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(8);
  });

  // Negative Numbers
  it('solves negative arithmetic -10, -5, 0, 5 -> 10', () => {
    const result = solveSequence('-10, -5, 0, 5');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(10);
  });

  // Decimals
  it('solves decimals 1.5, 3.0, 4.5, 6.0 -> 7.5', () => {
    const result = solveSequence('1.5, 3.0, 4.5, 6.0');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(7.5);
  });

  // Prime Numbers
  it('detects prime numbers correctly', () => {
    const result = solveSequence('2, 3, 5, 7');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Prime Numbers');
    expect(result.next).toBe(11);
  });

  // Factorials
  it('detects factorial sequence correctly', () => {
    const result = solveSequence('1, 2, 6, 24');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Factorial Sequence');
    expect(result.next).toBe(120);
  });

  // Error cases
  it('returns error for less than 3 numbers', () => {
    expect(solveSequence('1, 2').error).toBe('Please enter at least 3 numbers.');
    expect(solveSequence('5').error).toBe('Please enter at least 3 numbers.');
    expect(solveSequence('').error).toBe('Please enter at least 3 numbers.');
  });

  // 2-Level Arithmetic
  it('solves 2-level arithmetic 1, 3, 6, 10, 15 -> 21', () => {
    const result = solveSequence('1, 3, 6, 10, 15');
    expect(result).not.toBeNull();
    expect(result.type).toBe('2-Level Arithmetic');
    expect(result.next).toBe(21);
  });

  it('solves 2-level arithmetic 2, 4, 7, 11 -> 16', () => {
    const result = solveSequence('2, 4, 7, 11');
    expect(result).not.toBeNull();
    expect(result.type).toBe('2-Level Arithmetic');
    expect(result.next).toBe(16);
  });

  // Interleaved with exactly 4 numbers
  it('handles minimum interleaved sequence with 4 numbers', () => {
    const result = solveSequence('1, 100, 2, 99');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.predictions).toEqual([3, 98]);
  });

  // Geometric with zeros
  it('returns fallback for geometric with zero', () => {
    const result = solveSequence('0, 0, 0, 0');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Arithmetic Progression');
    expect(result.next).toBe(0);
  });

  // Coverage for L95
  it('does not detect interleaved for 3 numbers (L95 coverage)', () => {
    const result = solveSequence('1, 10, 2');
    expect(result).not.toBeNull();
    expect(result.type).not.toBe('Interleaved Sequence');
  });

  // Extended prime sequence
  it('detects longer prime sequence', () => {
    const result = solveSequence('2, 3, 5, 7, 11, 13');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Prime Numbers');
    expect(result.next).toBe(17);
  });

  // Non-consecutive primes
  it('does not detect non-consecutive primes as prime sequence', () => {
    const result = solveSequence('2, 5, 11, 17');
    expect(result).not.toBeNull();
    expect(result.type).not.toBe('Prime Numbers');
  });

  // Extended factorial sequence
  it('detects longer factorial sequence', () => {
    const result = solveSequence('1, 2, 6, 24, 120');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Factorial Sequence');
    expect(result.next).toBe(720);
  });

  // Fibonacci starting with different values
  it('detects fibonacci starting from 2, 3', () => {
    const result = solveSequence('2, 3, 5, 8, 13');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Fibonacci Sequence');
    expect(result.next).toBe(21);
  });

  // Visualization connections check
  it('includes proper visualization connections for arithmetic', () => {
    const result = solveSequence('10, 20, 30, 40');
    expect(result.visualization).toBeDefined();
    expect(result.visualization.nodes.length).toBe(5);
    expect(result.visualization.connections.length).toBe(4);
    expect(result.visualization.connections[0].type).toBe('add');
    expect(result.visualization.connections[0].label).toBe('+10');
  });

  // Visualization connections for subtraction
  it('includes proper visualization for subtraction', () => {
    const result = solveSequence('50, 40, 30, 20');
    expect(result.visualization.connections[0].type).toBe('sub');
    expect(result.visualization.connections[0].label).toBe('-10');
  });

  // Interleaved where last index is odd
  it('handles interleaved where last index is odd', () => {
    const result = solveSequence('1, 10, 2, 9, 3');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Interleaved Sequence');
  });

  // Complex Interleaved Visualization Coverage
  it('generates correct visualization connections for interleaved', () => {
    const result = solveSequence('2, 10, 4, 20, 6, 30');
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.isInterleaved).toBe(true);
    expect(result.next).toBe(8);
    expect(result.predictions).toEqual([8, 40]);

    const connections = result.visualization.connections;
    const evenConn = connections.find((c) => c.fromIndex === 0 && c.toIndex === 2);
    expect(evenConn).toBeDefined();
    expect(evenConn.label).toBe('+2');

    const oddConn = connections.find((c) => c.fromIndex === 1 && c.toIndex === 3);
    expect(oddConn).toBeDefined();
    expect(oddConn.label).toBe('+10');

    const evenPredConn = connections.find((c) => c.fromIndex === 4 && c.toIndex === 6);
    expect(evenPredConn).toBeDefined();

    const oddPredConn = connections.find((c) => c.fromIndex === 5 && c.toIndex === 7);
    expect(oddPredConn).toBeDefined();
  });

  // Unknown Pattern / Hints
  it('falls back to hints for unknown patterns', () => {
    const result = solveSequence('47, 3, 89, 12, 56, 94, 21, 68, 7, 73');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Unknown Pattern');
    expect(result.isHint).toBe(true);
    expect(result.next).toBe('?');
    expect(result.visualization.connections.length).toBe(9);
  });

  // Geometric edge case
  it('handles float precision in geometric detection', () => {
    const result = solveSequence('1, 1.1, 1.21, 1.331');
    expect(result.type).toBe('Geometric Progression');
    expect(result.next).toBeCloseTo(1.4641);
  });

  // =====================
  // INTERLEAVED SUB-SOLVER COVERAGE (L108-114)
  // =====================

  it('solves interleaved with geometric sub-sequence (L108)', () => {
    const result = solveSequence('2, 5, 4, 10, 8, 15, 16, 20');
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(32);
  });

  it('solves interleaved with fibonacci sub-sequence (L110)', () => {
    const result = solveSequence('1, 10, 1, 10, 2, 10, 3, 10, 5, 10');
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(8);
  });

  it('solves interleaved with 2-level sub-sequence (L112)', () => {
    const result = solveSequence('1, 5, 3, 5, 6, 5, 10, 5');
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(15);
  });

  it('solves interleaved with power sub-sequence (L114)', () => {
    const result = solveSequence('1, 2, 4, 4, 9, 6, 16, 8');
    expect(result.type).toBe('Interleaved Sequence');
    expect(result.next).toBe(25);
  });
});
