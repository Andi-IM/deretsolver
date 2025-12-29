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
      rule: `Arithmetic sequence with difference ${diff}`,
      explanation: `Each number ${diff > 0 ? 'increases' : 'decreases'} by ${Math.abs(diff)}. ${seq[seq.length - 1]} ${diff > 0 ? '+' : '-'} ${Math.abs(diff)} = ${next}.`,
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
      rule: `Geometric sequence with ratio ${ratio}`,
      explanation: `Each term is multiplied by ${ratio}. ${seq[seq.length - 1]} * ${ratio} = ${next}.`,
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
      rule: 'Perfect squares',
      explanation: `The terms are squares of consecutive integers (${startN}², ${startN + 1}², ...). The next is ${startN + length}² = ${next}.`,
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
      rule: 'Perfect cubes',
      explanation: `The terms are cubes of consecutive integers (${startN}³, ${startN + 1}³, ...). The next is ${startN + length}³ = ${next}.`,
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
      rule: 'Fibonacci-like sequence',
      explanation: `Each number is the sum of the previous two numbers. ${seq[seq.length - 1]} + ${seq[seq.length - 2]} = ${next}.`,
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
      rule: 'Prime numbers',
      explanation: `The sequence consists of consecutive prime numbers. The next prime after ${seq[seq.length - 1]} is ${next}.`,
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
      rule: 'Factorials',
      explanation: `The terms are factorials of consecutive integers (${startN}!, ${startN + 1}!, ...). The next is ${startN + length}! = ${next}.`,
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
      rule: 'Two-level difference',
      explanation: `The differences between terms are ${diffs.join(', ')}. These differences increase by ${diffInc}. The next difference is ${nextDiff}. ${current} + ${nextDiff} = ${next}.`,
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
