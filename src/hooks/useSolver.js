import { useState } from "react";
import { solveSequence } from "../utils/solver";
import { solveWithGemini } from "../utils/geminiSolver";

export const useSolver = () => {
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(
    import.meta.env.GOOGLE_AI_APIKEY ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ""
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
      setResult(localRes);
      return;
    }

    // 2. Fallback to Gemini if valid input
    if (input.trim().length > 0) {
      setIsLoading(true);
      const geminiRes = await solveWithGemini(input, apiKey);
      const transformToNestedFormat = (result) => {
        if (result.error) return result;

        const predictionCount = result.predictions
          ? result.predictions.length
          : 1;
        const nodes = result.sequenceValues.map((value, i) => ({
          value,
          label: result.sequenceLabels[i],
          isPrediction: i >= result.sequenceValues.length - predictionCount,
        }));

        return {
          type: result.type,
          rule: result.rule,
          next: result.next,
          predictions: result.predictions,
          isInterleaved: result.isInterleaved,
          visualization: { nodes, connections: result.connections },
        };
      };

      setIsLoading(false);

      if (geminiRes.error) {
        setError(geminiRes.error || localRes.error); // Prioritize Gemini error (e.g. Auth failure) if fallback was attempted
      } else {
        const nestedResult = transformToNestedFormat(geminiRes);
        setResult(nestedResult);
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
