/**
 * DeretSolver Logic
 * Detects patterns in number sequences.
 */

const solveSequence = (input) => {
  // Parse input: allow commas, spaces, etc.
  const nums = input
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  if (nums.length < 3) {
    return { error: 'Please enter at least 3 numbers.' };
  }

  // Visual data structure: { nodes: [{val, label}], links: [{label, type}] }
  // Type: 'add', 'sub', 'mul', 'pow', 'none'

  let result = null;

  // 1. Arithmetic (+/-)
  result = detectArithmetic(nums);
  if (result) return result;

  // 2. Geometric (* /)
  result = detectGeometric(nums);
  if (result) return result;

  // 3. Square/Cube (Check this early as it is specific)
  result = detectPower(nums);
  if (result) return result;

  // 4. Fibonacci
  result = detectFibonacci(nums);
  if (result) return result;

  // 5. Prime Numbers
  result = detectPrimes(nums);
  if (result) return result;

  // 6. Factorials
  result = detectFactorials(nums);
  if (result) return result;

  // 7. Two-Level Difference
  result = detectTwoLevel(nums);
  if (result) return result;

  // 8. Interleaved (Alternating)
  result = detectInterleaved(nums);
  if (result) return result;

  return generateHints(nums);
};

function generateHints(nums) {
  // If no pattern found, calculate simple diffs to give a hint
  const connections = [];
  for (let i = 0; i < nums.length - 1; i += 1) {
    const diff = nums[i + 1] - nums[i];
    connections.push({
      fromIndex: i,
      toIndex: i + 1,
      label: diff >= 0 ? `+${diff}` : `${diff}`,
      type: 'other', // Gray color
    });
  }

  const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));

  // We do NOT predict next value in hint mode
  // But resultSection expects 'next' property to be displayed or it might crash if accessed?
  // ResultSection handles missing predictions[] but usually expects result.next?
  // Let's set result.next to "?" or handle it in UI.
  // ResultSection: {result.next} is used if predictions.length <= 1.

  return {
    type: 'Unknown Pattern',
    rule: 'Showing differences to help you find the pattern manually.',
    next: '?',
    isHint: true,
    visualization: { nodes, connections },
    // Include error message so useSolver can still detect it as a "failure" of the local solver
    // to trigger Gemini fallback if needed.
    error: 'Pattern not found locally.', 
    // Wait, if I include 'error', useSolver will treat it as failure and NOT set result.
    // I need to separate "Failure that triggers Gemini" vs "Final Result if Gemini fails".
    // I will return the hint object. useSolver needs to know it's a hint.
  };
}

function detectInterleaved(nums) {
  // Requires at least 4 numbers to reliably detect 2 patterns (2 for each)
  if (nums.length < 4) return null;

  const evens = nums.filter((_, i) => i % 2 === 0);
  const odds = nums.filter((_, i) => i % 2 === 1);

  // Recursively solve both
  // IMPORTANT: avoid infinite recursion if sub-sequence is also interleaved?
  // Ideally we stick to basic patterns for sub-sequences to keep it simple.
  // Create a mini-solver that only checks basics
  const solveBasic = (arr) => {
    let res = detectArithmetic(arr);
    if (res) return res;
    res = detectGeometric(arr);
    if (res) return res;
    res = detectFibonacci(arr);
    if (res) return res;
    res = detectTwoLevel(arr);
    if (res) return res;
    res = detectPower(arr);
    if (res) return res;
    return null;
  };

  const resEven = solveBasic(evens);
  const resOdd = solveBasic(odds);

  if (resEven && resOdd) {
    // Both valid!
    const isLastEven = (nums.length - 1) % 2 === 0;

    // Predict next numbers
    const nextEven = resEven.next;
    const nextOdd = resOdd.next;

    // Determine immediate next based on who's turn it is
    // If last index was even, next index is odd -> so nextOdd
    // If last index was odd, next index is even -> so nextEven
    const next = isLastEven ? nextOdd : nextEven;

    // Predictions array: [immediate_next, number_after_that]
    const predictions = isLastEven ? [nextOdd, nextEven] : [nextEven, nextOdd];

    // Merge nodes and connections
    // We need to remap indices from sub-sequences to main sequence
    // Even indices: 0, 2, 4 -> remap (i_sub) => 2 * i_sub
    // Odd indices: 1, 3, 5 -> remap (i_sub) => 2 * i_sub + 1

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));

    // Add prediction nodes
    nodes.push({
      value: predictions[0],
      label: isLastEven ? 'Next (Odd)' : 'Next (Even)',
      isPrediction: true,
    });
    nodes.push({
      value: predictions[1],
      label: isLastEven ? 'Next (Even)' : 'Next (Odd)',
      isPrediction: true,
    });

    const connections = [];

    // Map even connections
    if (resEven.visualization && resEven.visualization.connections) {
      resEven.visualization.connections.forEach((c) => {
        connections.push({
          fromIndex: c.fromIndex * 2,
          toIndex: c.toIndex * 2, // This handles the jump
          label: c.label,
          type: c.type,
        });
      });
      // Add connection to prediction?
      // The sub-solver usually adds 'next' logic implicitly or via the last link?
      // Wait, local solvers return connections for existing nums.
      // Let's add the connection to the prediction manually.
      // Even prediction connects from last Even (index 2*(evens.length-1)) to even prediction (index: length + (isLastEven?1:0)) ... logic gets complex.

      // Simplification: Recalculate connection to prediction for even
      // Even prediction is at: nums.length (if next is even) OR nums.length + 1 (if next is odd)
      // Actually, predictions[0] is at nums.length. predictions[1] is at nums.length + 1.

      const lastEvenGlobalIndex = (evens.length - 1) * 2;
      const targetEvenPredIndex = isLastEven ? nums.length + 1 : nums.length;

      // We need to find the rule label again or extract it from last connection?
      // Local solver doesn't easily expose the raw diff/ratio in consistent way except in 'rule' text or last link.
      // Let's grab the label from the last link of sub-result if exists
      const lastLink =
        resEven.visualization.connections[resEven.visualization.connections.length - 1];
      if (lastLink) {
        connections.push({
          fromIndex: lastEvenGlobalIndex,
          toIndex: targetEvenPredIndex,
          label: lastLink.label,
          type: lastLink.type,
        });
      }
    }

    // Map odd connections
    if (resOdd.visualization && resOdd.visualization.connections) {
      resOdd.visualization.connections.forEach((c) => {
        connections.push({
          fromIndex: c.fromIndex * 2 + 1,
          toIndex: c.toIndex * 2 + 1,
          label: c.label,
          type: c.type,
        });
      });

      const lastOddGlobalIndex = (odds.length - 1) * 2 + 1;
      const targetOddPredIndex = isLastEven ? nums.length : nums.length + 1;

      const lastLink =
        resOdd.visualization.connections[resOdd.visualization.connections.length - 1];
      if (lastLink) {
        connections.push({
          fromIndex: lastOddGlobalIndex,
          toIndex: targetOddPredIndex,
          label: lastLink.label,
          type: lastLink.type,
        });
      }
    }

    return {
      type: 'Interleaved Sequence',
      rule: `Interleaved: [${resEven.type}] and [${resOdd.type}]`,
      next,
      predictions,
      isInterleaved: true,
      visualization: { nodes, connections },
    };
  }

  return null;
}

function detectArithmetic(nums) {
  const diff = nums[1] - nums[0];
  const isArithmetic = nums.every((n, i) => i === 0 || n - nums[i - 1] === diff);

  if (isArithmetic) {
    const next = nums[nums.length - 1] + diff;
    const rule = diff >= 0 ? `Add ${diff}` : `Subtract ${Math.abs(diff)}`;

    // Visualization
    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = [];
    for (let i = 0; i < nums.length; i += 1) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: diff >= 0 ? `+${diff}` : `${diff}`,
        type: diff >= 0 ? 'add' : 'sub',
      });
    }

    return {
      type: 'Arithmetic Progression',
      rule,
      next,
      visualization: { nodes, connections },
    };
  }
  return null;
}

function detectGeometric(nums) {
  if (nums.includes(0)) return null; // Avoid division by zero issues for simple geo
  const ratio = nums[1] / nums[0];
  // Check if all follow ratio (allow small float error? No, assume integer sequences for now or precise floats)
  const isGeometric = nums.every((n, i) => i === 0 || Math.abs(n / nums[i - 1] - ratio) < 0.0001);

  if (isGeometric) {
    const next = nums[nums.length - 1] * ratio;
    const rule = `Multiply by ${parseFloat(ratio.toFixed(2))}`;

    // Visualization
    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({
      value: parseFloat(next.toFixed(2)),
      label: 'Next',
      isPrediction: true,
    });

    const connections = [];
    for (let i = 0; i < nums.length; i += 1) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: `x${parseFloat(ratio.toFixed(2))}`,
        type: 'mul',
      });
    }

    return {
      type: 'Geometric Progression',
      rule,
      next: parseFloat(next.toFixed(2)),
      visualization: { nodes, connections },
    };
  }
  return null;
}

function detectFibonacci(nums) {
  // Standard fib: next = sum of prev two
  // Check if n[i] = n[i-1] + n[i-2] for i >= 2
  const isFib = nums.every((n, i) => i < 2 || n === nums[i - 1] + nums[i - 2]);

  if (isFib) {
    const next = nums[nums.length - 1] + nums[nums.length - 2];
    const nodes = [
      ...nums.map((n, i) => ({ value: n, label: `i=${i}` })),
      { value: next, label: 'Next', isPrediction: true },
    ];

    // Fib has connections from i-2 and i-1 to i. But for simple linear visualization we might just showing +?
    // Actually fib is tricky to visualize linearly. Let's do simple i to i+1 flow with 'sum' label for now, or maybe arcs?
    // Let's stick to simple flow for now as local solver is basic.
    const connections = [];
    for (let i = 0; i < nums.length; i += 1) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: 'sum',
        type: 'add',
      });
    }

    return {
      type: 'Fibonacci Sequence',
      rule: 'Sum of previous two numbers',
      next,
      visualization: {
        nodes,
        connections,
      },
    };
  }
  return null;
}

function detectTwoLevel(nums) {
  // Differences of differences are constant
  // 1, 2, 4, 7, 11 (diffs: 1, 2, 3, 4 -> diffs2: 1, 1, 1)
  const diffs = [];
  for (let i = 1; i < nums.length; i += 1) diffs.push(nums[i] - nums[i - 1]);

  // Check if diffs are arithmetic
  const subResult = detectArithmetic(diffs);
  if (subResult) {
    const nextDiff = subResult.next;
    const next = nums[nums.length - 1] + nextDiff;

    const nodes = [
      ...nums.map((n, i) => ({ value: n, label: `i=${i}` })),
      { value: next, label: 'Next', isPrediction: true },
    ];
    const connections = diffs.map((d, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: d >= 0 ? `+${d}` : `${d}`,
      type: 'add',
    }));
    connections.push({
      fromIndex: nums.length - 1,
      toIndex: nums.length,
      label: `+${nextDiff}`,
      type: 'add',
    });

    return {
      type: '2-Level Arithmetic',
      rule: `Differences increase by constant`,
      next,
      visualization: {
        nodes,
        connections,
      },
    };
  }
  return null;
}

function detectPower(nums) {
  // Check if n = i^2 or i^3 (assuming 1-based or 0-based index?)
  // Or just check if sqrt is int?
  // 1, 4, 9, 16
  const roots2 = nums.map((n) => Math.sqrt(n));
  if (roots2.every((r) => Number.isInteger(r))) {
    // Check if roots are arithmetic
    const rootResult = detectArithmetic(roots2);
    if (rootResult) {
      const nextRoot = rootResult.next;
      const next = nextRoot * nextRoot;

      const connections = [];
      for (let i = 0; i < nums.length; i += 1) {
        connections.push({
          fromIndex: i,
          toIndex: i + 1,
          label: '^2',
          type: 'pow',
        });
      }

      return {
        type: 'Perfect Squares',
        rule: 'Squares of integers',
        next,
        visualization: {
          nodes: [
            ...nums.map((n, i) => ({ value: n, label: `i=${i}` })),
            { value: next, label: 'Next', isPrediction: true },
          ],
          connections,
        },
      };
    }
  }

  // Check for Cubes
  const roots3 = nums.map((n) => Math.cbrt(n));
  // Use a small epsilon for float precision issues with cbrt, or Math.round if expected int
  // Math.cbrt(8) is 2. Math.cbrt(64) is 4.
  if (roots3.every((r) => Math.abs(r - Math.round(r)) < 0.0001)) {
    const roundedRoots = roots3.map(Math.round);
    const rootResult = detectArithmetic(roundedRoots);
    if (rootResult) {
      const nextRoot = rootResult.next;
      const next = nextRoot * nextRoot * nextRoot;

      const connections = [];
      for (let i = 0; i < nums.length; i += 1) {
        connections.push({
          fromIndex: i,
          toIndex: i + 1,
          label: '^3',
          type: 'pow',
        });
      }

      return {
        type: 'Perfect Cubes',
        rule: 'Cubes of integers',
        next,
        visualization: {
          nodes: [
            ...nums.map((n, i) => ({ value: n, label: `i=${i}` })),
            { value: next, label: 'Next', isPrediction: true },
          ],
          connections,
        },
      };
    }
  }

  return null;
}

function detectPrimes(nums) {
  // Primes: 2, 3, 5, 7, 11...
  // Check if all numbers are valid consecutive primes

  const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  // 1. All must be prime
  if (!nums.every(isPrime)) return null;

  // 2. Must be consecutive primes in ascending order
  // Generate primes up to the last number + gap to verify consecutiveness
  // Heuristic: Find index of first number in prime list

  const generatePrimes = (max) => {
    const primes = [];
    for (let i = 2; i <= max; i++) {
      if (isPrime(i)) primes.push(i);
    }
    return primes;
  };

  // Generate enough primes to cover the range significantly
  // (Assuming reasonable input size < 1000 for local solver)
  const lastNum = nums[nums.length - 1];
  // Generate a bit more to find the next one
  const referencePrimes = generatePrimes(lastNum + 100);

  const startIndex = referencePrimes.indexOf(nums[0]);
  if (startIndex === -1) return null; // Should not happen if isPrime check passed

  // Check if input sequence matches the reference slice
  const slice = referencePrimes.slice(startIndex, startIndex + nums.length);
  const isConsecutivePrimes = JSON.stringify(slice) === JSON.stringify(nums);

  if (isConsecutivePrimes) {
    const nextFn = referencePrimes[startIndex + nums.length]; // The one after the slice

    // Visualization
    const nodes = nums.map((n, i) => ({ value: n, label: `p${i + 1}` }));
    nodes.push({ value: nextFn, label: 'Next Prime', isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: 'prime',
      type: 'other',
    }));
    // Connect to prediction
    connections.push({
      fromIndex: nums.length - 1,
      toIndex: nums.length,
      label: 'prime',
      type: 'other',
    });

    return {
      type: 'Prime Numbers',
      rule: 'Sequence of consecutive prime numbers',
      next: nextFn,
      visualization: { nodes, connections },
    };
  }

  return null;
}

function detectFactorials(nums) {
  // 1, 2, 6, 24, 120... (n!)
  // Check if nums[i] == (i+1)! or similar offset?
  // Or just check if each number is a factorial.

  const getFactorialMap = (maxVal) => {
    const map = new Map();
    let f = 1;
    let i = 1;
    while (f <= maxVal) {
      map.set(f, i); // value -> index (1->1, 2->2, 6->3, 24->4)
      i++;
      f *= i;
    }
    return map;
  };

  const lastNum = nums[nums.length - 1];
  const factorialMap = getFactorialMap(Math.max(lastNum, 120)); // Ensure at least some range

  if (!nums.every((n) => factorialMap.has(n))) return null;

  // Check consecutiveness of the factorial indices
  const indices = nums.map((n) => factorialMap.get(n));
  const detectIndices = detectArithmetic(indices);

  if (detectIndices && detectIndices.rule.includes('Add 1')) {
    // Valid consecutive factorials
    const nextIndex = indices[indices.length - 1] + 1;

    // Calculate next factorial
    let nextFreq = 1;
    for (let k = 1; k <= nextIndex; k++) nextFreq *= k;

    const nodes = nums.map((n, i) => ({ value: n, label: `${indices[i]}!` }));
    nodes.push({ value: nextFreq, label: `${nextIndex}!`, isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: `x${indices[i + 1]}`, // 2 -> 6 is x3
      type: 'mul',
    }));
    connections.push({
      fromIndex: nums.length - 1,
      toIndex: nums.length,
      label: `x${nextIndex}`,
      type: 'mul',
    });

    return {
      type: 'Factorial Sequence',
      rule: 'Factorials of consecutive integers',
      next: nextFreq,
      visualization: { nodes, connections },
    };
  }

  return null;
}

export default solveSequence;
