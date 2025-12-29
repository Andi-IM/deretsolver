import { describe, expect, it, vi } from 'vitest';

import { selectBestResult, transformToNestedFormat } from '@/hooks/useSolver';

// Mock logger to avoid console noise
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('transformToNestedFormat', () => {
  it('should return input as-is if it has an error', () => {
    const errorResult = { error: 'Some error' };
    expect(transformToNestedFormat(errorResult)).toEqual(errorResult);
  });

  it('should return null/undefined as-is', () => {
    expect(transformToNestedFormat(null)).toBeNull();
    expect(transformToNestedFormat(undefined)).toBeUndefined();
  });

  it('should transform solver result to nested format', () => {
    const solverResult = {
      type: 'Arithmetic',
      rule: 'Add 2',
      next: 10,
      predictions: [10],
      sequenceValues: [2, 4, 6, 8, 10],
      sequenceLabels: ['i=0', 'i=1', 'i=2', 'i=3', 'NEXT'],
      connections: [{ fromIndex: 0, toIndex: 1, type: 'add', label: '+2' }],
    };

    const result = transformToNestedFormat(solverResult);

    expect(result.type).toBe('Arithmetic');
    expect(result.rule).toBe('Add 2');
    expect(result.next).toBe(10);
    expect(result.visualization.nodes).toHaveLength(5);
    expect(result.visualization.nodes[4].isPrediction).toBe(true);
    expect(result.visualization.connections).toEqual(solverResult.connections);
  });

  it('should handle missing sequenceLabels gracefully', () => {
    const solverResult = {
      type: 'Geometric',
      rule: 'Multiply by 2',
      next: 16,
      sequenceValues: [2, 4, 8, 16],
      // No sequenceLabels
    };

    const result = transformToNestedFormat(solverResult);

    expect(result.visualization.nodes[0].label).toBe('i=0');
    expect(result.visualization.nodes[1].label).toBe('i=1');
  });

  it('should handle multiple predictions', () => {
    const solverResult = {
      type: 'Arithmetic',
      rule: 'Add 1',
      predictions: [4, 5, 6],
      sequenceValues: [1, 2, 3, 4, 5, 6],
      sequenceLabels: ['i=0', 'i=1', 'i=2', 'NEXT', 'NEXT', 'NEXT'],
      connections: [],
    };

    const result = transformToNestedFormat(solverResult);

    // Last 3 should be predictions
    expect(result.visualization.nodes[3].isPrediction).toBe(true);
    expect(result.visualization.nodes[4].isPrediction).toBe(true);
    expect(result.visualization.nodes[5].isPrediction).toBe(true);
    expect(result.visualization.nodes[2].isPrediction).toBe(false);
  });
});

describe('selectBestResult', () => {
  it('should return Gemini result when successful', () => {
    const geminiRes = {
      type: 'Fibonacci',
      rule: 'Sum of previous two',
      sequenceValues: [1, 1, 2, 3, 5],
    };

    const { result, error } = selectBestResult(null, geminiRes);

    expect(error).toBeNull();
    expect(result.type).toBe('Fibonacci');
  });

  it('should fallback to local hints when Gemini fails', () => {
    const localRes = { type: 'Hint', isHint: true, rule: 'Try looking at differences' };
    const geminiRes = { error: 'API rate limited' };

    const { result, error } = selectBestResult(localRes, geminiRes);

    expect(result).toEqual(localRes);
    expect(error).toContain('API rate limited');
    expect(error).toContain('hints');
  });

  it('should return error when both fail', () => {
    const localRes = { error: 'Invalid input' };
    const geminiRes = { error: 'API error' };

    const { result, error } = selectBestResult(localRes, geminiRes);

    expect(result).toBeNull();
    expect(error).toBe('API error');
  });

  it('should use local error when Gemini has no error message', () => {
    const localRes = { error: 'Local validation failed' };
    const geminiRes = null;

    const { result, error } = selectBestResult(localRes, geminiRes);

    expect(result).toBeNull();
    expect(error).toBe('Local validation failed');
  });
});
