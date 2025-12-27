import { useState } from 'react';

import solveWithGemini from '@/utils/geminiSolver';
import solveSequence from '@/utils/solver';

export const useSolver = () => {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(
    import.meta.env.GOOGLE_AI_APIKEY || import.meta.env.VITE_GEMINI_API_KEY || '',
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSolve = async () => {
    setError(null);
    setResult(null);
    setIsLoading(false);

    // 1. Try Local Solver
    const localRes = solveSequence(input);

    if (localRes && !localRes.error) {
      setResult({ ...localRes, id: Date.now() });
      return;
    }

    // 2. Fallback to Gemini if valid input
    if (input.trim().length > 0) {
      setIsLoading(true);
      const geminiRes = await solveWithGemini(input, apiKey);
      const transformToNestedFormat = (solverResult) => {
        if (solverResult.error) return solverResult;

        const predictionCount = solverResult.predictions ? solverResult.predictions.length : 1;
        const nodes = solverResult.sequenceValues.map((value, i) => ({
          value,
          label: solverResult.sequenceLabels[i],
          isPrediction: i >= solverResult.sequenceValues.length - predictionCount,
        }));

        return {
          type: solverResult.type,
          rule: solverResult.rule,
          next: solverResult.next,
          predictions: solverResult.predictions,
          isInterleaved: solverResult.isInterleaved,
          visualization: { nodes, connections: solverResult.connections },
        };
      };

      setIsLoading(false);

      if (geminiRes.error) {
        setError(geminiRes.error || localRes.error); // Prioritize Gemini error (e.g. Auth failure) if fallback was attempted
      } else {
        const nestedResult = transformToNestedFormat(geminiRes);
        setResult({ ...nestedResult, id: Date.now() });
      }
    } else {
      setError(localRes.error);
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
