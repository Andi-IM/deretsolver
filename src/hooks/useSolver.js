import { useState } from 'react';

import solveWithGemini from '@/utils/geminiSolver';
import logger from '@/utils/logger';
import solveSequence from '@/utils/solver';

/**
 * Transforms a flat solver result into the nested visualization format.
 * This is a PURE FUNCTION - no side effects, easily testable.
 *
 * @param {Object} solverResult - The raw result from geminiSolver
 * @returns {Object} - Transformed result with visualization structure
 */
export function transformToNestedFormat(solverResult) {
  if (!solverResult || solverResult.error) return solverResult;

  const predictionCount = solverResult.predictions ? solverResult.predictions.length : 1;

  // Build nodes array for visualization
  const nodes = (solverResult.sequenceValues || []).map((value, i) => ({
    value,
    label: solverResult.sequenceLabels?.[i] || `i=${i}`,
    isPrediction: i >= (solverResult.sequenceValues?.length || 0) - predictionCount,
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
 * Another PURE FUNCTION - easily testable without React.
 *
 * @param {Object} localRes - Result from local solver
 * @param {Object} geminiRes - Result from Gemini API
 * @returns {Object} - { result, error } to display
 */
export function selectBestResult(localRes, geminiRes) {
  // Case 1: Gemini succeeded
  if (geminiRes && !geminiRes.error) {
    const nestedResult = transformToNestedFormat(geminiRes);
    return { result: nestedResult, error: null };
  }

  // Case 2: Gemini failed but we have local hints
  if (geminiRes?.error && localRes?.isHint) {
    logger.warn('Gemini failed, falling back to local hints:', geminiRes.error);
    return {
      result: localRes,
      error: geminiRes.error + ' Showing manual hints instead.',
    };
  }

  // Case 3: Both failed
  return {
    result: null,
    error: geminiRes?.error || localRes?.error || 'Unable to solve sequence',
  };
}

/**
 * Custom hook for solving number sequences.
 */
export const useSolver = () => {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSolve = async () => {
    setError(null);
    setResult(null);
    setIsLoading(false);

    // 1. Try Local Solver first
    const localRes = solveSequence(input);

    if (localRes && !localRes.error) {
      setResult({ ...localRes, id: Date.now() });
      return;
    }

    // 2. Fallback to Gemini if valid input
    if (input.trim().length > 0) {
      setIsLoading(true);
      const geminiRes = await solveWithGemini(input, apiKey);
      setIsLoading(false);

      const { result: bestResult, error: bestError } = selectBestResult(localRes, geminiRes);

      if (bestResult) {
        setResult({ ...bestResult, id: Date.now() });
      }
      if (bestError) {
        setError(bestError);
      }
    } else {
      // Empty input
      setError(localRes?.error || 'Please enter a sequence');
    }
  };

  return {
    input,
    setInput,
    apiKey,
    setApiKey,
    handleSolve,
    result,
    error,
    isLoading,
    setError,
  };
};

export default useSolver;
