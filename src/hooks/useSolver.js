import { useCallback, useReducer } from 'react';

import solveWithGemini from '@/utils/geminiSolver';
import logger from '@/utils/logger';
import solveSequence from '@/utils/solver';

// =============================================================================
// PURE FUNCTIONS - Easily testable without React
// =============================================================================

/**
 * Transforms a flat solver result into the nested visualization format.
 * @param {Object} solverResult - The raw result from geminiSolver
 * @returns {Object} - Transformed result with visualization structure
 */
export function transformToNestedFormat(solverResult) {
  if (!solverResult || solverResult.error) return solverResult;

  const predictionCount = solverResult.predictions ? solverResult.predictions.length : 1;

  const values = solverResult.sequenceValues || [];
  const total = values.length;

  const nodes = values.map((value, i) => ({
    value,
    label: solverResult.sequenceLabels?.[i] || `i=${i}`,
    isPrediction: i >= total - predictionCount,
  }));

  return {
    type: solverResult.type,
    rule: solverResult.rule,
    next: solverResult.next,
    predictions: solverResult.predictions,
    isInterleaved: solverResult.isInterleaved,
    visualization: {
      nodes,
      connections: solverResult.connections || [],
    },
  };
}

/**
 * Determines the best result to show based on local and Gemini responses.
 * @param {Object} localRes - Result from local solver
 * @param {Object} geminiRes - Result from Gemini API
 * @returns {Object} - { result, error } to display
 */
export function selectBestResult(localRes, geminiRes) {
  if (geminiRes && !geminiRes.error) {
    const nestedResult = transformToNestedFormat(geminiRes);
    return { result: nestedResult, error: null };
  }

  if (geminiRes?.error && localRes?.isHint) {
    logger.warn('Gemini failed, falling back to local hints:', geminiRes.error);
    return {
      result: localRes,
      error: geminiRes.error + ' Showing manual hints instead.',
    };
  }

  return {
    result: null,
    error: geminiRes?.error || localRes?.error || 'Unable to solve sequence',
  };
}

// =============================================================================
// REDUCER - Pure function, easy to test state transitions
// =============================================================================

export const initialState = {
  input: '',
  apiKey: '',
  result: null,
  error: null,
  isLoading: false,
};

export const ActionTypes = {
  SET_INPUT: 'SET_INPUT',
  SET_API_KEY: 'SET_API_KEY',
  SOLVE_START: 'SOLVE_START',
  SOLVE_LOCAL_SUCCESS: 'SOLVE_LOCAL_SUCCESS',
  SOLVE_LOADING: 'SOLVE_LOADING',
  SOLVE_SUCCESS: 'SOLVE_SUCCESS',
  SOLVE_ERROR: 'SOLVE_ERROR',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
};

/**
 * Reducer function for solver state - PURE FUNCTION
 */
export function solverReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_INPUT:
      return { ...state, input: action.payload };

    case ActionTypes.SET_API_KEY:
      return { ...state, apiKey: action.payload };

    case ActionTypes.SOLVE_START:
      return { ...state, error: null, result: null, isLoading: false };

    case ActionTypes.SOLVE_LOCAL_SUCCESS:
      return {
        ...state,
        result: { ...action.payload, id: Date.now() },
        error: null,
        isLoading: false,
      };

    case ActionTypes.SOLVE_LOADING:
      return { ...state, isLoading: true };

    case ActionTypes.SOLVE_SUCCESS:
      return {
        ...state,
        result: action.payload.result ? { ...action.payload.result, id: Date.now() } : null,
        error: action.payload.error,
        isLoading: false,
      };

    case ActionTypes.SOLVE_ERROR:
      return { ...state, error: action.payload, result: null, isLoading: false };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

// =============================================================================
// EXTRACTED ASYNC LOGIC - Pure function for testability
// =============================================================================

/**
 * Core solving logic extracted as a pure async function.
 * This can be tested independently without React hooks.
 *
 * @param {string} input - The sequence input
 * @param {string} apiKey - API key for Gemini
 * @param {Function} dispatch - Dispatch function from useReducer
 * @param {Object} deps - Injectable dependencies for testing
 * @returns {Promise<void>}
 */
export async function executeSolve(input, apiKey, dispatch, deps = {}) {
  const { localSolver = solveSequence, geminiSolver = solveWithGemini } = deps;

  dispatch({ type: ActionTypes.SOLVE_START });

  // 1. Try Local Solver first
  const localRes = localSolver(input);

  if (localRes && !localRes.error) {
    dispatch({ type: ActionTypes.SOLVE_LOCAL_SUCCESS, payload: localRes });
    return;
  }

  // 2. Fallback to Gemini if valid input
  if (input.trim().length > 0) {
    dispatch({ type: ActionTypes.SOLVE_LOADING });

    const geminiRes = await geminiSolver(input, apiKey);
    const { result, error } = selectBestResult(localRes, geminiRes);

    dispatch({ type: ActionTypes.SOLVE_SUCCESS, payload: { result, error } });
  } else {
    dispatch({
      type: ActionTypes.SOLVE_ERROR,
      payload: localRes?.error || 'Please enter a sequence',
    });
  }
}

// =============================================================================
// HOOK - Thin wrapper using extracted logic
// =============================================================================

/**
 * Custom hook for solving number sequences using useReducer.
 * @param {Object} options - Optional dependencies for testing
 * @returns {Object} - Hook state and methods
 */
export const useSolver = (options = {}) => {
  const [state, dispatch] = useReducer(solverReducer, options.initialState || initialState);

  const setInput = useCallback(
    (value) => dispatch({ type: ActionTypes.SET_INPUT, payload: value }),
    [],
  );

  const setApiKey = useCallback(
    (value) => dispatch({ type: ActionTypes.SET_API_KEY, payload: value }),
    [],
  );

  const setError = useCallback(
    (value) => dispatch({ type: ActionTypes.SET_ERROR, payload: value }),
    [],
  );

  const handleSolve = useCallback(
    () => executeSolve(state.input, state.apiKey, dispatch, options.deps),
    [state.input, state.apiKey, options.deps],
  );

  return {
    input: state.input,
    apiKey: state.apiKey,
    result: state.result,
    error: state.error,
    isLoading: state.isLoading,
    setInput,
    setApiKey,
    setError,
    handleSolve,
    dispatch,
    state,
  };
};

export default useSolver;
