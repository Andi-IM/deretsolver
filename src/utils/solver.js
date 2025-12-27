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

  // 5. Two-Level Difference
  result = detectTwoLevel(nums);
  if (result) return result;

  // 6. Interleaved (Alternating)
  result = detectInterleaved(nums);
  if (result) return result;

  return { error: 'Pattern not found.' };
};

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

export default solveSequence;
