import { describe, expect, it } from 'vitest';

import { SEQUENCE_TYPES, generateQuestion } from './quizGenerator';

describe('quizGenerator', () => {
  it('should generate a valid question structure', () => {
    const q = generateQuestion();
    expect(q).toHaveProperty('sequence');
    expect(q).toHaveProperty('options');
    expect(q).toHaveProperty('correctAnswer');
    expect(q).toHaveProperty('rule');
    expect(q).toHaveProperty('explanation');
    expect(Array.isArray(q.sequence)).toBe(true);
    expect(Array.isArray(q.options)).toBe(true);
    expect(q.options).toHaveLength(4);
  });

  it('options should contain the correct answer', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion();
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it('should generate specific types when requested', () => {
    const qEasy = generateQuestion('EASY');
    expect([SEQUENCE_TYPES.ARITHMETIC, SEQUENCE_TYPES.GEOMETRIC]).toContain(qEasy.type);

    const qHard = generateQuestion('HARD');
    expect([SEQUENCE_TYPES.PRIME, SEQUENCE_TYPES.FACTORIAL]).toContain(qHard.type);
  });

  it('should generate valid arithmetic sequence', () => {
    let q;
    do {
      q = generateQuestion('EASY');
    } while (q.type !== SEQUENCE_TYPES.ARITHMETIC && q.type !== SEQUENCE_TYPES.GEOMETRIC);

    expect(q.sequence.length).toBeGreaterThanOrEqual(3);
  });

  it('should have unique options', () => {
    const q = generateQuestion();
    const unique = new Set(q.options);
    expect(unique.size).toBe(4);
  });

  it('should generate valid medium difficulty sequences (including two-level)', () => {
    let hitTwoLevel = false;
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('MEDIUM');
      if (q.type === SEQUENCE_TYPES.TWO_LEVEL) {
        hitTwoLevel = true;
        expect(q.sequence.length).toBeGreaterThanOrEqual(3);
        expect(q.explanation.key).toBe('quiz.explanations.two_level');
        expect(q.explanation.data).toHaveProperty('diffs');
        expect(q.explanation.data).toHaveProperty('diffInc');
      }
    }
    expect(hitTwoLevel).toBe(true);
  });

  it('should format floating point numbers correctly (decimal coverage)', () => {
    let hitDecimals = false;
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('EASY');
      if (q.type === SEQUENCE_TYPES.GEOMETRIC) {
        const allNumbers = [...q.sequence, ...q.options, q.correctAnswer];
        const hasDecimal = allNumbers.some((n) => !Number.isInteger(n));

        if (hasDecimal) {
          hitDecimals = true;
          allNumbers.forEach((n) => {
            if (!Number.isInteger(n)) {
              const decimalPart = n.toString().split('.')[1];
              expect(decimalPart.length).toBeLessThanOrEqual(2);
            }
          });
        }
      }
    }
    expect(hitDecimals).toBe(true);
  });

  it('should generate valid arithmetic sequence (decreasing coverage)', () => {
    // We need to hit the negative difference branch
    let hitNegative = false;
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion('EASY');
      if (q.type === SEQUENCE_TYPES.ARITHMETIC) {
        // Check explanation data for negative sign
        if (q.explanation.data.sign === '-') {
          hitNegative = true;
          expect(q.explanation.key).toBe('quiz.explanations.arithmetic');
          expect(q.explanation.data.action).toBe('quiz.explanations.arithmetic_decrease');

          // Verify the sequence is actually decreasing
          expect(q.sequence[1]).toBeLessThan(q.sequence[0]);
        }
      }
    }
    expect(hitNegative).toBe(true);
  });
});
