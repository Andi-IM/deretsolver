import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ActionTypes,
  executeSolve,
  initialState,
  selectBestResult,
  solverReducer,
  transformToNestedFormat,
  useSolver,
} from '@/hooks/useSolver';

// Mock dependencies
vi.mock('@/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
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
    expect(result.visualization.nodes).toHaveLength(5);
    expect(result.visualization.nodes[4].isPrediction).toBe(true);
  });

  it('should handle missing sequenceLabels', () => {
    const solverResult = { type: 'Geometric', sequenceValues: [2, 4, 8, 16] };
    const result = transformToNestedFormat(solverResult);
    expect(result.visualization.nodes[0].label).toBe('i=0');
  });
});

describe('selectBestResult', () => {
  it('should return Gemini result when successful', () => {
    const geminiRes = { type: 'Fibonacci', sequenceValues: [1, 1, 2, 3, 5] };
    const { result, error } = selectBestResult(null, geminiRes);
    expect(error).toBeNull();
    expect(result.type).toBe('Fibonacci');
  });

  it('should fallback to local hints when Gemini fails', () => {
    const localRes = { type: 'Hint', isHint: true };
    const geminiRes = { error: 'API error' };
    const { result, error } = selectBestResult(localRes, geminiRes);
    expect(result).toEqual(localRes);
    expect(error).toContain('API error');
  });

  it('should return error when both fail', () => {
    const localRes = { error: 'Invalid' };
    const geminiRes = { error: 'API error' };
    const { result, error } = selectBestResult(localRes, geminiRes);
    expect(result).toBeNull();
    expect(error).toBe('API error');
  });
});

describe('solverReducer', () => {
  it('should return current state for unknown action', () => {
    const state = solverReducer(initialState, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  it('should handle SET_INPUT', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SET_INPUT,
      payload: '1, 2, 3',
    });
    expect(state.input).toBe('1, 2, 3');
  });

  it('should handle SET_API_KEY', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SET_API_KEY,
      payload: 'test-key',
    });
    expect(state.apiKey).toBe('test-key');
  });

  it('should handle SOLVE_START', () => {
    const prevState = { ...initialState, error: 'old', result: {} };
    const state = solverReducer(prevState, { type: ActionTypes.SOLVE_START });
    expect(state.error).toBeNull();
    expect(state.result).toBeNull();
  });

  it('should handle SOLVE_LOCAL_SUCCESS', () => {
    const result = { type: 'Arithmetic', next: 5 };
    const state = solverReducer(initialState, {
      type: ActionTypes.SOLVE_LOCAL_SUCCESS,
      payload: result,
    });
    expect(state.result.type).toBe('Arithmetic');
    expect(state.result.id).toBeDefined();
  });

  it('should handle SOLVE_LOADING', () => {
    const state = solverReducer(initialState, { type: ActionTypes.SOLVE_LOADING });
    expect(state.isLoading).toBe(true);
  });

  it('should handle SOLVE_SUCCESS with result', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SOLVE_SUCCESS,
      payload: { result: { type: 'Complex' }, error: null },
    });
    expect(state.result.type).toBe('Complex');
    expect(state.isLoading).toBe(false);
  });

  it('should handle SOLVE_SUCCESS with error', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SOLVE_SUCCESS,
      payload: { result: null, error: 'API failed' },
    });
    expect(state.result).toBeNull();
    expect(state.error).toBe('API failed');
  });

  it('should handle SOLVE_ERROR', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SOLVE_ERROR,
      payload: 'Error message',
    });
    expect(state.error).toBe('Error message');
  });

  it('should handle SET_ERROR', () => {
    const state = solverReducer(initialState, {
      type: ActionTypes.SET_ERROR,
      payload: 'Custom error',
    });
    expect(state.error).toBe('Custom error');
  });

  it('should handle RESET', () => {
    const modified = { input: 'test', apiKey: 'key', result: {}, error: 'err', isLoading: true };
    const state = solverReducer(modified, { type: ActionTypes.RESET });
    expect(state).toEqual(initialState);
  });
});

// =============================================================================
// executeSolve - PURE ASYNC FUNCTION TESTS (100% coverage)
// =============================================================================

describe('executeSolve', () => {
  let dispatch;
  let mockLocalSolver;
  let mockGeminiSolver;

  beforeEach(() => {
    dispatch = vi.fn();
    mockLocalSolver = vi.fn();
    mockGeminiSolver = vi.fn();
  });

  it('should dispatch SOLVE_START at beginning', async () => {
    mockLocalSolver.mockReturnValue({ type: 'Arithmetic', next: 5 });

    await executeSolve('1, 2, 3', '', dispatch, { localSolver: mockLocalSolver });

    expect(dispatch).toHaveBeenCalledWith({ type: ActionTypes.SOLVE_START });
  });

  it('should dispatch SOLVE_LOCAL_SUCCESS when local solver succeeds', async () => {
    const localResult = { type: 'Arithmetic', rule: 'Add 1', next: 5 };
    mockLocalSolver.mockReturnValue(localResult);

    await executeSolve('1, 2, 3, 4', '', dispatch, { localSolver: mockLocalSolver });

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.SOLVE_LOCAL_SUCCESS,
      payload: localResult,
    });
    expect(mockGeminiSolver).not.toHaveBeenCalled();
  });

  it('should fallback to Gemini when local solver fails', async () => {
    mockLocalSolver.mockReturnValue({ error: 'Cannot solve' });
    mockGeminiSolver.mockResolvedValue({ type: 'Complex', sequenceValues: [1, 2, 3] });

    await executeSolve('1, 2, 3', 'api-key', dispatch, {
      localSolver: mockLocalSolver,
      geminiSolver: mockGeminiSolver,
    });

    expect(dispatch).toHaveBeenCalledWith({ type: ActionTypes.SOLVE_LOADING });
    expect(mockGeminiSolver).toHaveBeenCalledWith('1, 2, 3', 'api-key');
    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.SOLVE_SUCCESS,
      payload: expect.objectContaining({ result: expect.any(Object) }),
    });
  });

  it('should dispatch SOLVE_ERROR when input is empty', async () => {
    mockLocalSolver.mockReturnValue({ error: 'Empty input' });

    await executeSolve('', '', dispatch, { localSolver: mockLocalSolver });

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.SOLVE_ERROR,
      payload: 'Empty input',
    });
  });

  it('should dispatch SOLVE_ERROR with default message when no error', async () => {
    mockLocalSolver.mockReturnValue(null);

    await executeSolve('   ', '', dispatch, { localSolver: mockLocalSolver });

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.SOLVE_ERROR,
      payload: 'Please enter a sequence',
    });
  });

  it('should handle Gemini error with local hints fallback', async () => {
    mockLocalSolver.mockReturnValue({ type: 'Hint', isHint: true, error: 'Pattern not found' });
    mockGeminiSolver.mockResolvedValue({ error: 'API quota exceeded' });

    await executeSolve('1, 5, 2, 8', '', dispatch, {
      localSolver: mockLocalSolver,
      geminiSolver: mockGeminiSolver,
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: ActionTypes.SOLVE_SUCCESS,
      payload: {
        result: expect.objectContaining({ isHint: true }),
        error: expect.stringContaining('API quota exceeded'),
      },
    });
  });

  it('should use default solvers when deps not provided', async () => {
    // This test verifies the function works without custom deps
    // We just need to ensure it doesn't crash
    const dispatchFn = vi.fn();

    // This will use actual solver which may return various results
    await executeSolve('2, 4, 6, 8', '', dispatchFn);

    expect(dispatchFn).toHaveBeenCalledWith({ type: ActionTypes.SOLVE_START });
  });
});

// =============================================================================
// useSolver hook tests
// =============================================================================

describe('useSolver hook', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useSolver());
    expect(result.current.input).toBe('');
    expect(result.current.apiKey).toBe('');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update input via setInput', () => {
    const { result } = renderHook(() => useSolver());
    act(() => {
      result.current.setInput('1, 2, 3, 4');
    });
    expect(result.current.input).toBe('1, 2, 3, 4');
  });

  it('should update apiKey via setApiKey', () => {
    const { result } = renderHook(() => useSolver());
    act(() => {
      result.current.setApiKey('my-api-key');
    });
    expect(result.current.apiKey).toBe('my-api-key');
  });

  it('should update error via setError', () => {
    const { result } = renderHook(() => useSolver());
    act(() => {
      result.current.setError('Custom error message');
    });
    expect(result.current.error).toBe('Custom error message');
  });

  it('should accept custom initial state', () => {
    const customInitial = { ...initialState, input: 'preset', apiKey: 'key' };
    const { result } = renderHook(() => useSolver({ initialState: customInitial }));
    expect(result.current.input).toBe('preset');
    expect(result.current.apiKey).toBe('key');
  });

  it('should expose dispatch and state', () => {
    const { result } = renderHook(() => useSolver());
    expect(typeof result.current.dispatch).toBe('function');
    expect(result.current.state).toEqual(initialState);
  });

  it('should call handleSolve with injected deps', async () => {
    const mockLocal = vi.fn().mockReturnValue({ type: 'Test', next: 10 });
    const { result } = renderHook(() => useSolver({ deps: { localSolver: mockLocal } }));

    act(() => {
      result.current.setInput('1, 2, 3');
    });

    await act(async () => {
      await result.current.handleSolve();
    });

    expect(mockLocal).toHaveBeenCalledWith('1, 2, 3');
  });
});
