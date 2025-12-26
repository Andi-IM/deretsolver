import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Solves a number sequence using the Gemini API.
 * @param {string} input - The standard input string (e.g., "1, 2, 3").
 * @param {string} apiKey - The user's Gemini API Key.
 * @returns {Promise<Object>} - The sequence analysis result or an error object.
 */
export const solveWithGemini = async (input, apiKey) => {
  if (!apiKey) {
    return { error: "Gemini API Key is required for advanced patterns." };
  }

  try {
    const client = new GoogleGenAI({ apiKey: apiKey });

    // Poin 1: Schema yang Disederhanakan
    const errorSchema = z.object({
      error: z
        .string()
        .describe(
          "Error message when pattern identification fails or input is invalid"
        ),
    });

    const digitPatternSchema = z.object({
      type: z
        .string()
        .describe(
          "Pattern type: 'Arithmetic', 'Geometric', 'Fibonacci', 'Interleaved Arithmetic', etc."
        ),

      rule: z
        .string()
        .describe(
          "Clear explanation of the pattern logic with mathematical operations"
        ),

      next: z.number().describe("Next predicted number in sequence"),

      // Simplified visualization - flatten structure
      sequenceValues: z
        .array(z.number())
        .describe("All sequence values including the prediction at the end"),

      sequenceLabels: z
        .array(z.string())
        .describe(
          "Labels for each value in order, e.g., 'n1', 'n2', 'n3', 'predicted'"
        ),

      operations: z
        .array(z.string())
        .describe(
          "Operations between consecutive values, e.g., '+3', '×2', '^2'. Array length = sequenceValues.length - 1"
        ),

      operationTypes: z
        .array(z.enum(["add", "sub", "mul", "pow", "other"]))
        .describe(
          "Type of each operation: add=addition, sub=subtraction, mul=multiplication, pow=power, other=complex. Same order as operations array"
        ),

      isInterleaved: z
        .boolean()
        .describe(
          "True if the sequence is composed of multiple interleaved sequences"
        ),

      predictions: z
        .array(z.number())
        .describe(
          "If interleaved, provide the next value for EACH sub-sequence. If single pattern, this array contains just the single 'next' value."
        ),
    });

    const providedSchema = z.union([digitPatternSchema, errorSchema]);

    // Poin 3: Gunakan Model Lebih Stabil
    const model = "gemini-3-flash-preview"; // atau "gemini-2.5-flash" jika sudah tersedia

    // Poin 2: Prompt dengan Instruksi Lebih Spesifik
    const prompt = `
Analyze this number sequence: "${input}"

Your tasks:
1. Identify the pattern type (e.g., Arithmetic Sequence, Geometric Sequence, Fibonacci, Interleaved patterns)
2. Explain the rule in plain language with clear mathematical operations
3. Predict the next number in the sequence (the immediate next number in the global sequence)
4. If interleaved, also predict the next number for EACH sub-sequence. They must be appended to the sequence in the order they would appear.
5. Generate visualization data:
   - sequenceValues: List ALL numbers as an array (original sequence + ALL predicted values).
   - sequenceLabels: Create a label for each value (e.g., "n1", "n2", ..., "pred1", "pred2").
   - operations: List the operation between each consecutive pair.
   - operationTypes: Classify each operation (e.g.,"add", "sub", "mul", "pow", "other").
   - isInterleaved: true/false
   - predictions: Array of predicted values.

Example for interleaved "1, 10, 2, 20, 3":
{
  "type": "Interleaved Sequence",
  "rule": "Sequence 1 increases by 1 (1, 2, 3...). Sequence 2 increases by 10 (10, 20...)",
  "next": 30, // Global next
  "sequenceValues": [1, 10, 2, 20, 3, 30, 4], // 30 is next for seq2, 4 is next for seq1 (assuming alternating)
  "sequenceLabels": ["n1", "n2", "n3", "n4", "n5", "pred (Seq2)", "pred (Seq1)"],
  "operations": [], 
  "operationTypes": [],
  "isInterleaved": true,
  "predictions": [30, 4] 
}

Important: 
- The operations array length must equal sequenceValues.length - 1
- For interleaved patterns, explain both sub-patterns in the rule
- Populating 'predictions' is CRITICAL for interleaved sequences. It must contain the next value for EACH sub-pattern.
- Ensure 'sequenceValues' contains the original sequence FOLLOWED BY the values in 'predictions' in the correct global order.

Provide accurate and consistent data for all fields.
    `.trim();

    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(providedSchema),
      },
    });

    console.log("Raw response:", response.text);
    const parsedJson = providedSchema.parse(JSON.parse(response.text));

    return parsedJson;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return {
      error: `Failed to connect to Gemini API: ${
        err.message || err
      }. Check your key and network connection.`,
    };
  }
};
