/**
 * DeretSolver Logic
 * Detects patterns in number sequences.
 */

export const solveSequence = (input) => {
  // Parse input: allow commas, spaces, etc.
  const nums = input.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  
  if (nums.length < 3) {
    return { error: "Please enter at least 3 numbers." };
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

  // 3. Fibonacci
  result = detectFibonacci(nums);
  if (result) return result;

  // 4. Two-Level Difference
  result = detectTwoLevel(nums);
  if (result) return result;
  
  // 5. Square/Cube
  result = detectPower(nums);
  if (result) return result;

  return { error: "Pattern not found." };
};

const detectArithmetic = (nums) => {
  const diff = nums[1] - nums[0];
  const isArithmetic = nums.every((n, i) => i === 0 || n - nums[i - 1] === diff);
  
  if (isArithmetic) {
    const next = nums[nums.length - 1] + diff;
    const rule = diff >= 0 ? `Add ${diff}` : `Subtract ${Math.abs(diff)}`;
    
    // Visualization
    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: next, label: 'Next', isPrediction: true });
    
    const links = [];
    for (let i = 0; i < nums.length; i++) {
      links.push({ 
        label: diff >= 0 ? `+${diff}` : `${diff}`,
        type: diff >= 0 ? 'add' : 'sub'
      });
    }

    return { type: 'Arithmetic Progression', rule, next, visualization: { nodes, links } };
  }
  return null;
};

const detectGeometric = (nums) => {
  if (nums.includes(0)) return null; // Avoid division by zero issues for simple geo
  const ratio = nums[1] / nums[0];
  // Check if all follow ratio (allow small float error? No, assume integer sequences for now or precise floats)
  const isGeometric = nums.every((n, i) => i === 0 || Math.abs(n / nums[i - 1] - ratio) < 0.0001);
  
  if (isGeometric) {
    const next = nums[nums.length - 1] * ratio;
    const rule = `Multiply by ${parseFloat(ratio.toFixed(2))}`;
     
    // Visualization
    const nodes = nums.map((n, i) => ({ value: n, label: `i=${i}` }));
    nodes.push({ value: parseFloat(next.toFixed(2)), label: 'Next', isPrediction: true });
    
    const links = [];
    for (let i = 0; i < nums.length; i++) {
        links.push({ label: `x${parseFloat(ratio.toFixed(2))}`, type: 'mul' });
    }
    
    return { type: 'Geometric Progression', rule, next: parseFloat(next.toFixed(2)), visualization: { nodes, links } };
  }
  return null;
};

const detectFibonacci = (nums) => {
    // Standard fib: next = sum of prev two
    // Check if n[i] = n[i-1] + n[i-2] for i >= 2
    const isFib = nums.every((n, i) => i < 2 || n === nums[i - 1] + nums[i - 2]);
    
    if (isFib) {
        const next = nums[nums.length - 1] + nums[nums.length - 2];
        return {
            type: 'Fibonacci Sequence',
            rule: 'Sum of previous two numbers',
            next,
            visualization: {
                nodes: [...nums.map((n,i) => ({value: n, label: `i=${i}`})), {value: next, label: 'Next', isPrediction: true}],
                links: nums.map(() => ({ label: 'sum', type: 'add' })) // Simplified link logic
            }
        };
    }
    return null;
};

const detectTwoLevel = (nums) => {
    // Differences of differences are constant
    // 1, 2, 4, 7, 11 (diffs: 1, 2, 3, 4 -> diffs2: 1, 1, 1)
    const diffs = [];
    for(let i=1; i<nums.length; i++) diffs.push(nums[i] - nums[i-1]);
    
    // Check if diffs are arithmetic
    const subResult = detectArithmetic(diffs);
    if (subResult) {
        const nextDiff = subResult.next;
        const next = nums[nums.length - 1] + nextDiff;
        
        // Visualization is tricky for 2-level, but let's try 1-level for now
        return {
            type: '2-Level Arithmetic',
            rule: `Differences increase by constant`,
            next,
             visualization: {
                nodes: [...nums.map((n,i) => ({value: n, label: `i=${i}`})), {value: next, label: 'Next', isPrediction: true}],
                links: diffs.map(d => ({ label: d>=0?`+${d}`:`${d}`, type: 'add' })).concat([{label: '...', type: 'add'}])
            }
        };
    }
    return null;
};

const detectPower = (nums) => {
    // Check if n = i^2 or i^3 (assuming 1-based or 0-based index?)
    // Or just check if sqrt is int? 
    // 1, 4, 9, 16
    const roots = nums.map(n => Math.sqrt(n));
    if (roots.every(r => Number.isInteger(r))) {
        // Check if roots are arithmetic
        const rootResult = detectArithmetic(roots);
        if(rootResult) {
             const nextRoot = rootResult.next;
             const next = nextRoot * nextRoot;
             return {
                 type: 'Perfect Squares',
                 rule: 'Squares of integers',
                 next,
                  visualization: {
                    nodes: [...nums.map((n,i) => ({value: n, label: `i=${i}`})), {value: next, label: 'Next', isPrediction: true}],
                    links: nums.map(() => ({ label: '^2', type: 'pow' }))
                }
             };
        }
    }
    return null;
}
