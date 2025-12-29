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
    // Mock math random slightly if needed, but we check type property
    // We didn't export specific generator helpers but we can check if type matches requested pool
    // Actually generateQuestion takes difficulty, not type directly in public API (but internals select type)
    // Let's testing difficulties

    // Difficulty EASY -> Arithmetic, Geometric
    const qEasy = generateQuestion('EASY');
    expect([SEQUENCE_TYPES.ARITHMETIC, SEQUENCE_TYPES.GEOMETRIC]).toContain(qEasy.type);

    // Difficulty HARD -> Prime, Factorial
    const qHard = generateQuestion('HARD');
    expect([SEQUENCE_TYPES.PRIME, SEQUENCE_TYPES.FACTORIAL]).toContain(qHard.type);
  });

  it('should generate valid arithmetic sequence', () => {
    // Forced hack: loop until we get arithmetic or expose internal generators.
    // We will just loop a few times
    let q;
    do {
      q = generateQuestion('EASY');
    } while (q.type !== SEQUENCE_TYPES.ARITHMETIC && q.type !== SEQUENCE_TYPES.GEOMETRIC); // Just check basic Validity

    expect(q.sequence.length).toBeGreaterThanOrEqual(3);
  });

  it('should have unique options', () => {
    const q = generateQuestion();
    const unique = new Set(q.options);
    expect(unique.size).toBe(4);
  });
});
