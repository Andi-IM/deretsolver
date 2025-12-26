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

      connections: z.preprocess(
        (val) => {
          // Handle array of stringified JSON objects
          if (Array.isArray(val)) {
            return val.map((item) => {
              if (typeof item === "string") {
                try {
                  // Parse the stringified JSON and remove backslashes
                  const cleaned = item.replace(/\\/g, "");
                  return JSON.parse(cleaned);
                } catch (e) {
                  console.error("Failed to parse connection item:", item, e);
                  return item; // Return as-is if parsing fails
                }
              }
              return item; // Already an object
            });
          }
          return val;
        },
        z
          .array(
            z.object({
              fromIndex: z
                .number()
                .describe("Index of the source value in sequenceValues"),
              toIndex: z
                .number()
                .describe("Index of the target value in sequenceValues"),
              label: z.string().describe("Operation label, e.g., '+3', 'x2'"),
              type: z
                .enum(["add", "sub", "mul", "pow", "other"])
                .describe("Type of operation"),
            })
          )
          .describe(
            "List of connections between values to visualize the pattern logic."
          )
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
    const model = "gemini-2.5-pro"; // atau "gemini-2.5-flash" jika sudah tersedia

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
   - connections: Create a list of connections to visualize the pattern.
     - For standard sequences, connect n[i] to n[i+1].
     - For interleaved or complex sequences, connect ONLY related terms (e.g., n[i] to n[i+2]).
   - isInterleaved: true/false
   - predictions: Array of predicted values.

Example for standard "2, 4, 6":
{
  "type": "Arithmetic Sequence",
  "rule": "Each number increases by 2",
  "next": 8,
  "sequenceValues": [2, 4, 6, 8],
  "sequenceLabels": ["n1", "n2", "n3", "predicted"],
  "connections": [
    {"fromIndex": 0, "toIndex": 1, "label": "+2", "type": "add"},
    {"fromIndex": 1, "toIndex": 2, "label": "+2", "type": "add"},
    {"fromIndex": 2, "toIndex": 3, "label": "+2", "type": "add"}
  ],
  "isInterleaved": false,
  "predictions": [8]
}

Example for interleaved "1, 10, 2, 20, 3":
{
  "type": "Interleaved Sequence",
  "rule": "Sequence 1 increases by 1 (1, 2, 3...). Sequence 2 increases by 10 (10, 20...)",
  "next": 30, // Global next
  "sequenceValues": [1, 10, 2, 20, 3, 30, 4], // 30 is next for seq2, 4 is next for seq1
  "sequenceLabels": ["n1", "n2", "n3", "n4", "n5", "pred (Seq2)", "pred (Seq1)"],
  "connections": [
    {"fromIndex": 0, "toIndex": 2, "label": "+1", "type": "add"}, // 1 -> 2
    {"fromIndex": 2, "toIndex": 4, "label": "+1", "type": "add"}, // 2 -> 3
    {"fromIndex": 4, "toIndex": 6, "label": "+1", "type": "add"}, // 3 -> 4 (pred)
    {"fromIndex": 1, "toIndex": 3, "label": "+10", "type": "add"}, // 10 -> 20
    {"fromIndex": 3, "toIndex": 5, "label": "+10", "type": "add"}  // 20 -> 30 (pred)
  ],
  "isInterleaved": true,
  "predictions": [30, 4] 
}

Important: 
- Identify the correct relationships. DO NOT connect unrelated numbers in interleaved sequences.
- 'connections' replaces the old 'operations' list. Be precise with indices.
- Ensure 'sequenceValues' contains the original sequence FOLLOWED BY the values in 'predictions'.
- Populating 'predictions' is CRITICAL for interleaved sequences.

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
    console.log("Parsed JSON: ", JSON.parse(response.text));
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
