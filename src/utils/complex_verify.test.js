import { describe, expect, it } from 'vitest';

import solveSequence from './solver';

describe('User Requested Complex Sequence Verification', () => {
  it('solves complex alternating sequence: [2, 8, 5, 20, 14, 56, 47, x] -> 188', () => {
    const input = '2, 8, 5, 20, 14, 56, 47, x';
    const result = solveSequence(input);

    console.log('Complex Sequence Result:', JSON.stringify(result, null, 2));

    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    expect(result.filledValues[7]).toBe(188);
  });
});
