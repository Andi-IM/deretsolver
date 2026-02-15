import { useCallback, useEffect, useReducer } from 'react';

import solveWithGemini from '@/utils/geminiSolver';
import logger from '@/utils/logger';
import solveSequence from '@/utils/solver';
import solveWithSumopod from '@/utils/sumopodSolver';

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

  const hasMissingValue = (solverResult.sequenceLabels || []).some(
    (label) => label && /^[xX?]+$|^\.\.\.$/.test(label),
  );

  return {
    type: solverResult.type,
    rule: solverResult.rule,
    next: solverResult.next,
    predictions: solverResult.predictions,
    isInterleaved: solverResult.isInterleaved,
    isMissingValue: hasMissingValue,
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
  aiProvider: 'gemini', // default
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
  SET_PROVIDER: 'SET_PROVIDER',
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

    case ActionTypes.SET_PROVIDER:
      return { ...state, aiProvider: action.payload };

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
export async function executeSolve(input, apiKey, dispatch, deps = {}, aiProvider = 'gemini') {
  const {
    localSolver = solveSequence,
    geminiSolver = solveWithGemini,
    sumopodSolver = solveWithSumopod,
  } = deps;

  dispatch({ type: ActionTypes.SOLVE_START });

  // 1. Try AI first if API key is available (for complex patterns)
  if (apiKey && input.trim().length > 0) {
    dispatch({ type: ActionTypes.SOLVE_LOADING });

    let aiRes;
    if (aiProvider === 'sumopod') {
      aiRes = await sumopodSolver(input, apiKey);
    } else {
      aiRes = await geminiSolver(input, apiKey);
    }

    if (aiRes && !aiRes.error) {
      const nestedResult = transformToNestedFormat(aiRes);
      dispatch({ type: ActionTypes.SOLVE_SUCCESS, payload: { result: nestedResult, error: null } });
      return;
    }

    // AI failed, log and continue to local solver
    logger.warn('AI solver failed, falling back to local solver:', aiRes?.error);
  }

  // 2. Fallback to Local Solver
  const localRes = localSolver(input);

  if (localRes && !localRes.error) {
    dispatch({ type: ActionTypes.SOLVE_LOCAL_SUCCESS, payload: localRes });
    return;
  }

  // 3. Both failed
  if (input.trim().length > 0) {
    dispatch({ type: ActionTypes.SOLVE_LOADING });
    const { result, error } = selectBestResult(localRes, { error: 'Unable to solve sequence' });
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
    () => executeSolve(state.input, state.apiKey, dispatch, options.deps, state.aiProvider),
    [state.input, state.apiKey, state.aiProvider, options.deps],
  );

  // Sync SumoPod key from env if available and provider is sumopod and no key set
  useEffect(() => {
    if (state.aiProvider === 'sumopod' && !state.apiKey) {
      // Look for key in environment variables (Vite pattern)
      const envKey = import.meta.env.VITE_SUMOPOD_AI_KEY || import.meta.env.SUMOPOD_AI_KEY;
      if (envKey) {
        dispatch({ type: ActionTypes.SET_API_KEY, payload: envKey });
      }
    }
  }, [state.aiProvider, state.apiKey]);

  const setProvider = useCallback(
    (value) => dispatch({ type: ActionTypes.SET_PROVIDER, payload: value }),
    [],
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
    setProvider,
    handleSolve,
    dispatch,
    state,
  };
};

export default useSolver;
