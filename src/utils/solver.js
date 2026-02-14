/**
 * DeretSolver - Pipeline Heuristik Bertingkat
 * Filosofi: "Fail Fast, Check Next"
 *
 * Stage 1: Low-Hanging Fruits (O(N)) - Constant Lookup, Delta-1, Ratio
 * Stage 2: Polynomial Hunter (O(N^2)) - Recursive Delta
 * Stage 3: Structural Analyst (O(N)) - Interleaved Splitter
 * Stage 4: Linear Recurrence (O(N)) - Linear Regression
 * Stage 5: Alternating Delta Pattern
 * Stage 6: Digit Logic (Fallback) - Digit Manipulation
 */

// =============================================================================
// MISSING VALUE SOLVER (Find X/ ?)
// =============================================================================

function solveWithMissingValues(parts, knownNums, placeholderIndices, _placeholderPattern) {
  const totalLength = parts.length;

  // Try to detect pattern using known numbers and fill in missing values
  let result = tryArithmeticWithMissing(knownNums, totalLength);
  if (result) return result;

  // Try interleaved pattern
  result = tryInterleavedWithMissing(parts, knownNums, totalLength, placeholderIndices);
  if (result) return result;

  return null;
}

function tryArithmeticWithMissing(nums, totalLength) {
  if (nums.length < 3) return null;

  const diff = nums[1] - nums[0];
  const isArithmetic = nums.every((n, i) => i === 0 || n - nums[i - 1] === diff);

  if (isArithmetic) {
    const nodes = [];
    for (let i = 0; i < totalLength; i++) {
      nodes.push({ value: nums[0] + diff * i, label: `i=${i}` });
    }

    const connections = [];
    for (let i = 0; i < totalLength - 1; i++) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: diff >= 0 ? `+${diff}` : `${diff}`,
        type: diff >= 0 ? 'add' : 'sub',
      });
    }

    return {
      type: 'Arithmetic Progression',
      rule: diff >= 0 ? `Add ${diff}` : `Subtract ${Math.abs(diff)}`,
      next: nums[0] + diff * (totalLength - 1),
      isSequenceComplete: true,
      filledValues: nodes.map((n) => n.value),
      visualization: { nodes, connections },
    };
  }

  return null;
}

function tryInterleavedWithMissing(parts, knownNums, totalLength, placeholderIndices) {
  const placeholderPattern = /^[xX?]+$|^\.\.\.$/;

  // Map positions to known values
  const positionToValue = new Map();
  let numIdx = 0;
  for (let i = 0; i < totalLength; i++) {
    if (!placeholderPattern.test(parts[i])) {
      positionToValue.set(i, knownNums[numIdx++]);
    }
  }

  // Extract even positions with their indices
  const evenPositions = [];
  const oddPositions = [];
  for (let i = 0; i < totalLength; i += 2) {
    if (positionToValue.has(i)) evenPositions.push({ pos: i, val: positionToValue.get(i) });
  }
  for (let i = 1; i < totalLength; i += 2) {
    if (positionToValue.has(i)) oddPositions.push({ pos: i, val: positionToValue.get(i) });
  }

  if (evenPositions.length < 2 || oddPositions.length < 2) return null;

  // Check if even positions form arithmetic using position-based calculation
  // For positions p0, p1: step = (v1-v0) / (p1-p0)
  // Value at position p = v0 + step * (p - p0)
  const evenStep =
    (evenPositions[1].val - evenPositions[0].val) / (evenPositions[1].pos - evenPositions[0].pos);
  const isEvenArithmetic = evenPositions.every(
    (n, i) =>
      i === 0 ||
      Math.abs(n.val - (evenPositions[0].val + evenStep * (n.pos - evenPositions[0].pos))) < 0.0001,
  );

  const oddStep =
    (oddPositions[1].val - oddPositions[0].val) / (oddPositions[1].pos - oddPositions[0].pos);
  const isOddArithmetic = oddPositions.every(
    (n, i) =>
      i === 0 ||
      Math.abs(n.val - (oddPositions[0].val + oddStep * (n.pos - oddPositions[0].pos))) < 0.0001,
  );

  if (isEvenArithmetic && isOddArithmetic) {
    // Fill in all values
    const filledValues = [];
    for (let i = 0; i < totalLength; i++) {
      if (i % 2 === 0) {
        filledValues.push(evenPositions[0].val + evenStep * (i - evenPositions[0].pos));
      } else {
        filledValues.push(oddPositions[0].val + oddStep * (i - oddPositions[0].pos));
      }
    }

    const answer = filledValues[placeholderIndices[0]];

    const nodes = filledValues.map((v, i) => ({
      value: v,
      label: `i=${i}`,
      isPrediction: placeholderIndices.includes(i),
    }));

    const connections = [];
    for (let i = 0; i < totalLength - 1; i++) {
      const d = filledValues[i + 1] - filledValues[i];
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: d >= 0 ? `+${d}` : `${d}`,
        type: d >= 0 ? 'add' : 'sub',
      });
    }

    return {
      type: 'Interleaved Sequence',
      rule: `Even: +${evenStep} per position, Odd: +${oddStep} per position`,
      next: answer,
      predictions: filledValues.slice(placeholderIndices[0]),
      filledValues,
      isInterleaved: true,
      visualization: { nodes, connections },
    };
  }

  return null;
}

const solveSequence = (input) => {
  // Parse input - keep track of original input and find placeholder positions
  const parts = input.split(/[\s,]+/);

  // Check for placeholders (X, ?, ...)
  const placeholderPattern = /^[xX?]+$|^\.\.\.$/;
  const hasPlaceholder = parts.some((p) => placeholderPattern.test(p));

  // Extract numbers (filter out placeholders)
  const nums = parts
    .map((p) => (placeholderPattern.test(p) ? null : Number(p)))
    .filter((n) => n !== null && !Number.isNaN(n));

  // Find the placeholder indices
  const placeholderIndices = parts
    .map((p, i) => (placeholderPattern.test(p) ? i : -1))
    .filter((i) => i !== -1);

  if (nums.length < 2) {
    // Need at least 2 numbers to detect patterns (for placeholder detection)
    // But need at least 3 for regular pattern detection
    const hasPlaceholder = parts.some((p) => /^[xX?]+$|^\.\.\.$/.test(p));
    if (hasPlaceholder && nums.length >= 2) {
      // Can try to solve with 2 numbers if there's a placeholder
    } else {
      return { error: 'Please enter at least 3 numbers.' };
    }
  }

  // If there are placeholders, try to fill them
  if (hasPlaceholder && placeholderIndices.length > 0) {
    const filledResult = solveWithMissingValues(
      parts,
      nums,
      placeholderIndices,
      placeholderPattern,
    );
    if (filledResult) return filledResult;
  }

  // Regular sequence solving
  if (nums.length < 3) {
    return { error: 'Please enter at least 3 numbers.' };
  }

  let result = null;

  // ============================================================================
  // STAGE 1: LOW-HANGING FRUITS (O(N))
  // ============================================================================

  // 1.1 Delta-1 Analysis: Arithmetic Progression (check first for 0,0,0,0 cases)
  result = detectArithmetic(nums);
  if (result) return result;

  // 1.2 Ratio Analysis: Geometric Progression
  result = detectGeometric(nums);
  if (result) return result;

  // 1.3 Constant Database Lookup: Fibonacci, Primes, Power (Square/Cube), Factorials
  result = detectConstantDatabase(nums);
  if (result) return result;

  // ============================================================================
  // STAGE 2: POLYNOMIAL HUNTER (O(N^2))
  // ============================================================================

  // 2.1 Recursive Delta Analysis: 2-Level, 3-Level, etc.
  result = detectRecursiveDelta(nums);
  if (result) return result;

  // ============================================================================
  // STAGE 3: STRUCTURAL ANALYST (O(N))
  // ============================================================================

  // 3.1 Interleaved Splitter: Odd/Even pattern detection
  result = detectInterleaved(nums);
  if (result) return result;

  // ============================================================================
  // STAGE 4: LINEAR RECURRENCE (O(N))
  // ============================================================================

  // 4.1 Linear Recurrence: a*n + b pattern
  result = detectLinearRecurrence(nums);
  if (result) return result;

  // ============================================================================
  // STAGE 5: ALTERNATING DELTA PATTERN
  // ============================================================================

  // 5.1 Alternating Delta: pattern like -1, +2, -1, +2, -1 repeating
  result = detectAlternatingDelta(nums);
  if (result) return result;

  // ============================================================================
  // STAGE 6: DIGIT LOGIC (FALLBACK)
  // ============================================================================

  // 6.1 Digit Manipulation: Sum of digits, Reverse, etc.
  result = detectDigitLogic(nums);
  if (result) return result;

  // ============================================================================
  // FINAL FALLBACK: HINTS
  // ============================================================================

  return generateHints(nums);
};

// =============================================================================
// STAGE 1.1: CONSTANT DATABASE LOOKUP
// =============================================================================

function detectConstantDatabase(nums) {
  // Try Fibonacci first
  let result = detectFibonacci(nums);
  if (result) return result;

  // Try Prime Numbers
  result = detectPrimes(nums);
  if (result) return result;

  // Try Perfect Squares
  result = detectPerfectSquares(nums);
  if (result) return result;

  // Try Perfect Cubes
  result = detectPerfectCubes(nums);
  if (result) return result;

  // Try Factorials
  result = detectFactorials(nums);
  if (result) return result;

  return null;
}

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

function detectFibonacci(nums) {
  const isFib = nums.every((n, i) => i < 2 || n === nums[i - 1] + nums[i - 2]);

  if (isFib) {
    const next = nums[nums.length - 1] + nums[nums.length - 2];
    const nodes = [
      ...nums.map((n, i) => ({ value: n, label: `i=${i}` })),
      { value: next, label: 'Next', isPrediction: true },
    ];

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
      visualization: { nodes, connections },
    };
  }
  return null;
}

function detectPrimes(nums) {
  const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  if (!nums.every(isPrime)) return null;

  const generatePrimes = (max) => {
    const primes = [];
    for (let i = 2; i <= max; i++) {
      if (isPrime(i)) primes.push(i);
    }
    return primes;
  };

  const lastNum = nums[nums.length - 1];
  const referencePrimes = generatePrimes(lastNum + 100);

  const startIndex = referencePrimes.indexOf(nums[0]);
  if (startIndex === -1) return null;

  const slice = referencePrimes.slice(startIndex, startIndex + nums.length);
  const isConsecutivePrimes = JSON.stringify(slice) === JSON.stringify(nums);

  if (isConsecutivePrimes) {
    const nextFn = referencePrimes[startIndex + nums.length];

    const nodes = nums.map((n, i) => ({ value: n, label: `p${i + 1}` }));
    nodes.push({ value: nextFn, label: 'Next Prime', isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: 'prime',
      type: 'other',
    }));
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

function detectPerfectSquares(nums) {
  const roots2 = nums.map((n) => Math.sqrt(n));
  if (roots2.every((r) => Number.isInteger(r))) {
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
  return null;
}

function detectPerfectCubes(nums) {
  const roots3 = nums.map((n) => Math.cbrt(n));
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

function detectFactorials(nums) {
  const getFactorialMap = (maxVal) => {
    const map = new Map();
    let f = 1;
    let i = 1;
    while (f <= maxVal) {
      map.set(f, i);
      i++;
      f *= i;
    }
    return map;
  };

  const lastNum = nums[nums.length - 1];
  const factorialMap = getFactorialMap(Math.max(lastNum, 120));

  if (!nums.every((n) => factorialMap.has(n))) return null;

  const indices = nums.map((n) => factorialMap.get(n));
  const detectIndices = detectArithmetic(indices);

  if (detectIndices && detectIndices.rule.includes('Add 1')) {
    const nextIndex = indices[indices.length - 1] + 1;

    let nextFreq = 1;
    for (let k = 1; k <= nextIndex; k++) nextFreq *= k;

    const nodes = nums.map((n, i) => ({ value: n, label: `${indices[i]}!` }));
    nodes.push({ value: nextFreq, label: `${nextIndex}!`, isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: `x${indices[i + 1]}`,
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

// =============================================================================
// STAGE 1.2: DELTA-1 ANALYSIS (ARITHMETIC)
// =============================================================================

function detectArithmetic(nums) {
  const diff = nums[1] - nums[0];
  const isArithmetic = nums.every((n, i) => i === 0 || n - nums[i - 1] === diff);

  if (isArithmetic) {
    const next = nums[nums.length - 1] + diff;
    const rule = diff >= 0 ? `Add ${diff}` : `Subtract ${Math.abs(diff)}`;

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

// =============================================================================
// STAGE 1.3: RATIO ANALYSIS (GEOMETRIC)
// =============================================================================

function detectGeometric(nums) {
  if (nums.includes(0)) return null;
  const ratio = nums[1] / nums[0];
  const isGeometric = nums.every((n, i) => i === 0 || Math.abs(n / nums[i - 1] - ratio) < 0.0001);

  if (isGeometric) {
    const next = nums[nums.length - 1] * ratio;
    const rule = `Multiply by ${parseFloat(ratio.toFixed(6))}`;

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({
      value: parseFloat(next.toFixed(6)),
      label: 'Next',
      isPrediction: true,
    });

    const connections = [];
    for (let i = 0; i < nums.length; i += 1) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: `x${parseFloat(ratio.toFixed(6))}`,
        type: 'mul',
      });
    }

    return {
      type: 'Geometric Progression',
      rule,
      next: parseFloat(next.toFixed(6)),
      visualization: { nodes, connections },
    };
  }
  return null;
}

// =============================================================================
// STAGE 2: RECURSIVE DELTA ANALYSIS (POLYNOMIAL HUNTER)
// =============================================================================

function detectRecursiveDelta(nums) {
  // First, try the simpler 2-level check (like original detectTwoLevel)
  // This checks if first differences form an arithmetic progression
  const diffs = [];
  for (let i = 1; i < nums.length; i++) {
    diffs.push(nums[i] - nums[i - 1]);
  }

  // Check if diffs themselves form a simple pattern
  // Use detectArithmetic on diffs (original approach)
  const subResult = detectArithmetic(diffs);
  if (subResult) {
    const nextDiff = subResult.next;
    const next = nums[nums.length - 1] + nextDiff;

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

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
      rule: 'Differences increase by constant',
      next,
      visualization: { nodes, connections },
    };
  }

  // Return 2-Level result if found
  // Note: Higher-level polynomial detection (3+) is disabled to avoid false positives
  // with interleaved sequences

  return null;
}

// =============================================================================
// STAGE 3: INTERLEAVED SPLITTER (STRUCTURAL ANALYST)
// =============================================================================

function detectInterleaved(nums) {
  // Require at least 4 numbers for interleaved detection
  if (nums.length < 4) return null;

  const evens = nums.filter((_, i) => i % 2 === 0);
  const odds = nums.filter((_, i) => i % 2 === 1);

  // Each sub-sequence must have at least 2 elements for pattern detection
  if (evens.length < 2 || odds.length < 2) return null;

  const solveBasic = (arr) => {
    // Only use Stage 1 & 2 detectors for sub-sequences
    let res = detectArithmetic(arr);
    if (res) return res;
    res = detectGeometric(arr);
    if (res) return res;
    res = detectFibonacci(arr);
    if (res) return res;
    res = detectRecursiveDelta(arr);
    if (res) return res;
    return null;
  };

  const resEven = solveBasic(evens);
  const resOdd = solveBasic(odds);

  if (resEven && resOdd) {
    const isLastEven = (nums.length - 1) % 2 === 0;

    const nextEven = resEven.next;
    const nextOdd = resOdd.next;

    const next = isLastEven ? nextOdd : nextEven;
    const predictions = isLastEven ? [nextOdd, nextEven] : [nextEven, nextOdd];

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));

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

    if (resEven.visualization && resEven.visualization.connections) {
      resEven.visualization.connections.forEach((c) => {
        connections.push({
          fromIndex: c.fromIndex * 2,
          toIndex: c.toIndex * 2,
          label: c.label,
          type: c.type,
        });
      });

      const lastEvenGlobalIndex = (evens.length - 1) * 2;
      const targetEvenPredIndex = isLastEven ? nums.length + 1 : nums.length;

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

// =============================================================================
// STAGE 4: LINEAR RECURRENCE SOLVER
// =============================================================================

function detectLinearRecurrence(nums) {
  // Detect pattern: a * n + b
  // For sequence u[n] = a * n + b
  // Check if (u[i+1] - u[i]) is constant after adjusting for index

  if (nums.length < 4) return null;

  // Try to find a and b such that u[i] = a * i + b
  // Using first two points to solve: b = u[0], a = u[1] - u[0]
  const a = nums[1] - nums[0];
  const b = nums[0];

  // Verify this pattern holds for all
  const isLinear = nums.every((n, i) => Math.abs(n - (a * i + b)) < 0.0001);

  if (isLinear && a !== 0) {
    const next = a * nums.length + b;

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: a >= 0 ? `+${a}` : `${a}`,
      type: 'add',
    }));
    connections.push({
      fromIndex: nums.length - 1,
      toIndex: nums.length,
      label: a >= 0 ? `+${a}` : `${a}`,
      type: 'add',
    });

    return {
      type: 'Linear Sequence',
      rule: `u[n] = ${a}*n + ${b}`,
      next,
      visualization: { nodes, connections },
    };
  }

  // Try linear recurrence: u[n] = a*u[n-1] + b
  // Check for common patterns
  return detectAffineRecurrence(nums);
}

function detectAffineRecurrence(nums) {
  // Try to find a and b such that u[n] = a * u[n-1] + b
  // Use first two valid equations to solve for a and b

  if (nums.length < 4) return null;

  // From u[1] = a*u[0] + b and u[2] = a*u[1] + b
  // Solve the system
  const u0 = nums[0],
    u1 = nums[1],
    u2 = nums[2];

  // If u0 == u1, we can't solve normally
  if (Math.abs(u1 - u0) < 0.0001) return null;

  const a = (u2 - u1) / (u1 - u0);
  const b = u1 - a * u0;

  if (Math.abs(a) < 0.0001 || !isFinite(a)) return null;

  // Verify for all
  const isAffine = nums.every((n, i) => i < 2 || Math.abs(n - (a * nums[i - 1] + b)) < 0.0001);

  if (isAffine) {
    const next = a * nums[nums.length - 1] + b;

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((_, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: `${parseFloat(a.toFixed(2))}*x + ${parseFloat(b.toFixed(2))}`,
      type: 'mul',
    }));

    return {
      type: 'Affine Recurrence',
      rule: `u[n] = ${parseFloat(a.toFixed(2))}*u[n-1] + ${parseFloat(b.toFixed(2))}`,
      next,
      visualization: { nodes, connections },
    };
  }

  return null;
}

// =============================================================================
// STAGE 5: ALTERNATING DELTA PATTERN
// =============================================================================

function detectAlternatingDelta(nums) {
  if (nums.length < 4) return null;

  const diffs = [];
  for (let i = 1; i < nums.length; i++) {
    diffs.push(nums[i] - nums[i - 1]);
  }

  // Check if signs alternate (positive, negative, positive, negative...)
  const signs = diffs.map((d) => Math.sign(d));
  const hasAlternatingSigns = signs.every((s, i) => i === 0 || s !== signs[i - 1]);

  if (!hasAlternatingSigns) return null;

  // Check if the pattern of absolute differences follows a repeating cycle
  const absDiffs = diffs.map(Math.abs);

  // Try to find a repeating pattern in the absolute differences
  // Pattern like [1, 2, 1, 2, 1] or [10, 60, 10, 60, 10]
  for (let patternLength = 2; patternLength <= 4; patternLength++) {
    if (diffs.length < patternLength * 2) continue;

    const pattern = absDiffs.slice(0, patternLength);
    let matches = true;

    for (let i = patternLength; i < absDiffs.length; i++) {
      if (absDiffs[i] !== pattern[i % patternLength]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      // Found a repeating pattern! Calculate the next value
      const nextDiff =
        (signs[signs.length - 1] === -1 ? 1 : -1) * pattern[diffs.length % patternLength];
      const next = nums[nums.length - 1] + nextDiff;

      const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
      nodes.push({ value: next, label: 'Next', isPrediction: true });

      const connections = diffs.map((d, i) => ({
        fromIndex: i,
        toIndex: i + 1,
        label: d >= 0 ? `+${d}` : `${d}`,
        type: d >= 0 ? 'add' : 'sub',
      }));
      connections.push({
        fromIndex: nums.length - 1,
        toIndex: nums.length,
        label: nextDiff >= 0 ? `+${nextDiff}` : `${nextDiff}`,
        type: nextDiff >= 0 ? 'add' : 'sub',
      });

      return {
        type: 'Alternating Delta',
        rule: `Alternating pattern: ${pattern.join(', ')} repeating`,
        next,
        visualization: { nodes, connections },
      };
    }
  }

  // Also check for a simpler alternating pattern where the magnitudes follow arithmetic
  // e.g., -1, +2, -1, +2 or -10, +60, -10, +60
  const uniqueAbsDiffs = [...new Set(absDiffs)];
  if (uniqueAbsDiffs.length === 2) {
    // Two magnitudes alternating
    const nextDiff = signs[signs.length - 1] === -1 ? uniqueAbsDiffs[0] : -uniqueAbsDiffs[0];
    const next = nums[nums.length - 1] + nextDiff;

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = diffs.map((d, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: d >= 0 ? `+${d}` : `${d}`,
      type: d >= 0 ? 'add' : 'sub',
    }));
    connections.push({
      fromIndex: nums.length - 1,
      toIndex: nums.length,
      label: nextDiff >= 0 ? `+${nextDiff}` : `${nextDiff}`,
      type: nextDiff >= 0 ? 'add' : 'sub',
    });

    return {
      type: 'Alternating Delta',
      rule: `Alternating: ${uniqueAbsDiffs[0]}, ${uniqueAbsDiffs[1]} repeating`,
      next,
      visualization: { nodes, connections },
    };
  }

  return null;
}

// =============================================================================
// STAGE 6: DIGIT LOGIC (FALLBACK)
// =============================================================================

function detectDigitLogic(nums) {
  // Check sum of digits pattern
  let result = detectSumOfDigits(nums);
  if (result) return result;

  // Check digit reversal pattern
  result = detectDigitReversal(nums);
  if (result) return result;

  // Check digit multiplication pattern
  result = detectDigitMultiplication(nums);
  if (result) return result;

  return null;
}

function detectSumOfDigits(nums) {
  // Check if sequence is sum of digits of some pattern
  const sums = nums.map((n) => {
    const str = Math.abs(n).toString();
    return str.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  });

  // Check if sums form a known pattern
  const arithResult = detectArithmetic(sums);
  if (arithResult) {
    const nextSum = arithResult.next;
    // Find a number with that sum (this is ambiguous, so we use a simple approach)
    const next = findNumberWithDigitSum(nextSum, nums[nums.length - 1]);

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = sums.slice(0, sums.length - 1).map((s, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: `sum(${nums[i]})=${s}`,
      type: 'other',
    }));

    return {
      type: 'Digit Sum Pattern',
      rule: `Sum of digits follows: ${arithResult.rule}`,
      next,
      visualization: { nodes, connections },
    };
  }

  return null;
}

function findNumberWithDigitSum(targetSum, _reference) {
  // Simple heuristic: find a reasonable number with the target digit sum
  // Prefer numbers close to the reference
  if (targetSum <= 9) return targetSum;

  // Try to construct a number with the target sum
  let remaining = targetSum;
  let result = 0;
  let place = 1;

  while (remaining > 9) {
    const digit = Math.min(9, remaining);
    result += digit * place;
    remaining -= digit;
    place *= 10;
  }
  result += remaining * place;

  return result;
}

function detectDigitReversal(nums) {
  // Check for pattern: 13, 31, 24, 42 (reversed pairs)
  if (nums.length < 4) return null;

  // Check if nums[i] and nums[i+1] are reversals
  const isReversal = (a, b) => {
    const strA = a.toString();
    const strB = b.toString();
    return strA.split('').reverse().join('') === strB;
  };

  let validPairs = true;
  for (let i = 0; i < nums.length - 1; i += 2) {
    if (!isReversal(nums[i], nums[i + 1])) {
      validPairs = false;
      break;
    }
  }

  if (validPairs && nums.length >= 4) {
    // Next pair should be reversal of each other
    const lastNum = nums[nums.length - 1];
    const next = parseInt(lastNum.toString().split('').reverse().join(''));

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      connections.push({
        fromIndex: i,
        toIndex: i + 1,
        label: 'reverse',
        type: 'other',
      });
    }

    return {
      type: 'Digit Reversal Pattern',
      rule: 'Numbers appear in reversed pairs',
      next,
      visualization: { nodes, connections },
    };
  }

  return null;
}

function detectDigitMultiplication(nums) {
  // Check if each number is formed by multiplying digits of previous
  // e.g., 12 -> 1*2 = 2 -> 2*? Not common, but let's try

  if (nums.length < 3) return null;

  // Check pattern: u[n] = product of digits of u[n-1]
  const productOfDigits = (n) => {
    const str = Math.abs(n).toString();
    if (str.includes('0')) return 0;
    return str.split('').reduce((acc, digit) => acc * parseInt(digit), 1);
  };

  const isDigitProduct = nums
    .slice(1)
    .every((n, i) => Math.abs(n - productOfDigits(nums[i])) < 0.0001);

  if (isDigitProduct && nums[1] !== nums[0]) {
    const next = productOfDigits(nums[nums.length - 1]);

    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });

    const connections = nums.slice(0, nums.length - 1).map((n, i) => ({
      fromIndex: i,
      toIndex: i + 1,
      label: `prod(${n})`,
      type: 'mul',
    }));

    return {
      type: 'Digit Product Pattern',
      rule: 'Each number is the product of digits of the previous number',
      next,
      visualization: { nodes, connections },
    };
  }

  return null;
}

// =============================================================================
// FINAL FALLBACK: HINTS
// =============================================================================

function generateHints(nums) {
  const connections = [];
  for (let i = 0; i < nums.length - 1; i += 1) {
    const diff = nums[i + 1] - nums[i];
    connections.push({
      fromIndex: i,
      toIndex: i + 1,
      label: diff >= 0 ? `+${diff}` : `${diff}`,
      type: 'other',
    });
  }

  const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));

  return {
    type: 'Unknown Pattern',
    rule: 'Showing differences to help you find the pattern manually.',
    next: '?',
    isHint: true,
    visualization: { nodes, connections },
    error: 'Pattern not found locally.',
  };
}

export default solveSequence;
