/**
 * Quiz Generator for Number Sequences
 * Generates questions with sequence, answer, options, and explanation.
 */

export const SEQUENCE_TYPES = {
  ARITHMETIC: 'arithmetic', // Easy
  GEOMETRIC: 'geometric', // Easy
  SQUARE: 'square', // Medium
  CUBE: 'cube', // Medium
  FIBONACCI: 'fibonacci', // Medium
  PRIME: 'prime', // Hard
  FACTORIAL: 'factorial', // Hard
  TWO_LEVEL: 'two_level', // Medium
};

const DIFFICULTIES = {
  EASY: [SEQUENCE_TYPES.ARITHMETIC, SEQUENCE_TYPES.GEOMETRIC],
  MEDIUM: [
    SEQUENCE_TYPES.SQUARE,
    SEQUENCE_TYPES.CUBE,
    SEQUENCE_TYPES.FIBONACCI,
    SEQUENCE_TYPES.TWO_LEVEL,
  ],
  HARD: [SEQUENCE_TYPES.PRIME, SEQUENCE_TYPES.FACTORIAL], // Can add Higher-Order if needed
  // Mixed pool for general generation
};

// Utils
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatNum = (n) => (Number.isInteger(n) ? n : Number(n.toFixed(2)));

// Generators
const generators = {
  [SEQUENCE_TYPES.ARITHMETIC]: () => {
    // pattern: n, n+d, n+2d...
    const start = randomInt(1, 20);
    const diff = randomChoice([-5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const length = randomInt(4, 6);
    const seq = Array.from({ length }, (_, i) => start + i * diff);
    const next = start + length * diff;
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.arithmetic', data: { diff } },
      explanation: {
        key: 'quiz.explanations.arithmetic',
        data: {
          action:
            diff > 0
              ? 'quiz.explanations.arithmetic_increase'
              : 'quiz.explanations.arithmetic_decrease',
          absDiff: Math.abs(diff),
          last: seq[seq.length - 1],
          sign: diff > 0 ? '+' : '-',
          next,
        },
      },
    };
  },
  [SEQUENCE_TYPES.GEOMETRIC]: () => {
    // pattern: n, n*r, n*r^2...
    const start = randomInt(1, 5);
    const ratio = randomChoice([2, 3, 4, 0.5]); // Keep small or simple fractions
    const length = 4;
    const seq = [];
    for (let i = 0; i < length; i++) seq.push(formatNum(start * Math.pow(ratio, i)));
    const next = formatNum(start * Math.pow(ratio, length));

    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.geometric', data: { ratio } },
      explanation: {
        key: 'quiz.explanations.geometric',
        data: { ratio, last: seq[seq.length - 1], next },
      },
    };
  },
  [SEQUENCE_TYPES.SQUARE]: () => {
    // pattern: n^2
    const startN = randomInt(1, 10);
    const length = randomInt(4, 5);
    const seq = Array.from({ length }, (_, i) => Math.pow(startN + i, 2));
    const next = Math.pow(startN + length, 2);
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.square' },
      explanation: {
        key: 'quiz.explanations.square',
        data: { start: startN, start_1: startN + 1, start_len: startN + length, next },
      },
    };
  },
  [SEQUENCE_TYPES.CUBE]: () => {
    // pattern: n^3
    const startN = randomInt(1, 5);
    const length = 4;
    const seq = Array.from({ length }, (_, i) => Math.pow(startN + i, 3));
    const next = Math.pow(startN + length, 3);
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.cube' },
      explanation: {
        key: 'quiz.explanations.cube',
        data: { start: startN, start_1: startN + 1, start_len: startN + length, next },
      },
    };
  },
  [SEQUENCE_TYPES.FIBONACCI]: () => {
    // pattern: f(n) = f(n-1) + f(n-2)
    const n1 = randomInt(1, 5);
    const n2 = randomInt(1, 5);
    const seq = [n1, n2];
    const length = randomInt(5, 7);
    for (let i = 2; i < length; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    const next = seq[length - 1] + seq[length - 2];
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.fibonacci' },
      explanation: {
        key: 'quiz.explanations.fibonacci',
        data: { last: seq[seq.length - 1], last_prev: seq[seq.length - 2], next },
      },
    };
  },
  [SEQUENCE_TYPES.PRIME]: () => {
    // primes
    const primes = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89,
      97,
    ];
    const startIdx = randomInt(0, primes.length - 6);
    const length = randomInt(4, 5);
    const seq = primes.slice(startIdx, startIdx + length);
    const next = primes[startIdx + length];
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.prime' },
      explanation: {
        key: 'quiz.explanations.prime',
        data: { last: seq[seq.length - 1], next },
      },
    };
  },
  [SEQUENCE_TYPES.FACTORIAL]: () => {
    // n!
    const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
    const startN = randomInt(1, 3);
    const length = 5;
    const seq = Array.from({ length }, (_, i) => factorial(startN + i));
    const next = factorial(startN + length);
    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.factorial' },
      explanation: {
        key: 'quiz.explanations.factorial',
        data: { start: startN, start_1: startN + 1, start_len: startN + length, next },
      },
    };
  },
  [SEQUENCE_TYPES.TWO_LEVEL]: () => {
    // 2nd diff is constant
    // base seq: n, n+k, n+2k... (arithmetic)
    // integrated seq: S_n = S_{n-1} + base_n
    let current = randomInt(1, 10);
    const diffStart = randomInt(1, 5);
    const diffInc = randomChoice([1, 2, 3]);
    const length = 5;
    const seq = [current];
    let currentDiff = diffStart;

    // Generate differences description for explanation
    const diffs = [];

    for (let i = 0; i < length - 1; i++) {
      diffs.push(currentDiff);
      current += currentDiff;
      seq.push(current);
      currentDiff += diffInc;
    }
    const nextDiff = currentDiff;
    const next = current + nextDiff;

    return {
      sequence: seq,
      answer: next,
      rule: { key: 'quiz.rules.two_level' },
      explanation: {
        key: 'quiz.explanations.two_level',
        data: { diffs: diffs.join(', '), diffInc, nextDiff, last: current, next },
      },
    };
  },
};

const generateDistractors = (answer, type) => {
  // Ensure unique options
  const options = new Set([answer]);

  // Strategy 1: Small Offset +/-
  options.add(formatNum(answer + randomChoice([1, 2, 3, -1, -2, -3])));

  // Strategy 2: Larger Offset / Random nearby (Answer +/- 10%)
  const magnitude = Math.max(1, Math.round(Math.abs(answer) * 0.1)) + 5;
  options.add(
    formatNum(answer + randomChoice([magnitude, -magnitude, magnitude + 1, -magnitude - 1])),
  );

  // Strategy 3: Type specific traps
  if (type === SEQUENCE_TYPES.ARITHMETIC || type === SEQUENCE_TYPES.TWO_LEVEL) {
    options.add(formatNum(answer + 10)); // Common decade error
  } else if (type === SEQUENCE_TYPES.GEOMETRIC) {
    options.add(formatNum(answer * 2)); // Double error
  } else {
    options.add(formatNum(answer + randomInt(4, 8)));
  }

  // Fill remaining if duplicates removed reduced size vs fixed tries
  while (options.size < 4) {
    options.add(formatNum(answer + randomInt(10, 50) * randomChoice([1, -1])));
  }

  // Convert to array and shuffle
  return Array.from(options)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
};

export const generateQuestion = (difficultyLevel) => {
  // Determine type
  let types = DIFFICULTIES.MEDIUM; // Default
  if (difficultyLevel && DIFFICULTIES[difficultyLevel]) {
    types = DIFFICULTIES[difficultyLevel];
  } else if (!difficultyLevel) {
    // Random mix if not specified
    const all = Object.values(DIFFICULTIES).flat();
    types = [randomChoice(all)];
  }

  const type = randomChoice(types);
  const data = generators[type]();

  const options = generateDistractors(data.answer, type);

  // Ensure correct answer is present (it is, because we started Set with it)
  // Just in case generateDistractors logic overwrote something? No, Set preserves.

  return {
    sequence: data.sequence,
    options,
    correctAnswer: data.answer,
    rule: data.rule,
    explanation: data.explanation,
    type,
  };
};

export default { generateQuestion, SEQUENCE_TYPES };
