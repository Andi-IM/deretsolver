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
      error: z.string().describe("Error message when pattern identification fails or input is invalid"),
    });

    const digitPatternSchema = z.object({
      type: z
        .string()
        .describe("Pattern type: 'Arithmetic', 'Geometric', 'Fibonacci', 'Interleaved Arithmetic', etc."),

      rule: z
        .string()
        .describe("Clear explanation of the pattern logic with mathematical operations"),

      next: z
        .number()
        .describe("Next predicted number in sequence"),

      // Simplified visualization - flatten structure
      sequenceValues: z
        .array(z.number())
        .describe("All sequence values including the prediction at the end"),

      sequenceLabels: z
        .array(z.string())
        .describe("Labels for each value in order, e.g., 'n1', 'n2', 'n3', 'predicted'"),

      operations: z
        .array(z.string())
        .describe("Operations between consecutive values, e.g., '+3', '×2', '^2'. Array length = sequenceValues.length - 1"),

      operationTypes: z
        .array(z.enum(["add", "sub", "mul", "pow", "other"]))
        .describe("Type of each operation: add=addition, sub=subtraction, mul=multiplication, pow=power, other=complex. Same order as operations array"),
    });

    const providedSchema = z.union([digitPatternSchema, errorSchema]);

    // Poin 3: Gunakan Model Lebih Stabil
    const model = "gemini-2.0-flash-exp"; // atau "gemini-2.5-flash" jika sudah tersedia

    // Poin 2: Prompt dengan Instruksi Lebih Spesifik
    const prompt = `
Analyze this number sequence: "${input}"

Your tasks:
1. Identify the pattern type (e.g., Arithmetic Sequence, Geometric Sequence, Fibonacci, Interleaved patterns)
2. Explain the rule in plain language with clear mathematical operations
3. Predict the next number in the sequence
4. Generate visualization data:
   - sequenceValues: List ALL numbers as an array (original sequence + your prediction at the end)
   - sequenceLabels: Create a label for each value (e.g., "n1", "n2", "n3", "predicted")
   - operations: List the operation between each consecutive pair (e.g., "+3", "×2", "^2", "-1")
   - operationTypes: Classify each operation as "add", "sub", "mul", "pow", or "other" in the same order

Example for sequence "2, 4, 6":
{
  "type": "Arithmetic Sequence",
  "rule": "Each number increases by 2",
  "next": 8,
  "sequenceValues": [2, 4, 6, 8],
  "sequenceLabels": ["n1", "n2", "n3", "predicted"],
  "operations": ["+2", "+2", "+2"],
  "operationTypes": ["add", "add", "add"]
}

Important: 
- The operations array length must equal sequenceValues.length - 1
- The operationTypes array length must equal operations array length
- Handle interleaved patterns (e.g., "9, 6, 9, 3" has two alternating sequences)
- For interleaved patterns, explain both sub-patterns in the rule

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
      error: `Failed to connect to Gemini API: ${err.message || err}. Check your key and network connection.`,
    };
  }
};
