const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

// Initialize Gemini Client
// Key must be set via: firebase functions:secrets:set GEMINI_API_KEY
// and accessed via process.env.GEMINI_API_KEY

/**
 * Solves a number sequence using Gemini (Server-Side).
 *
 * Input (data):
 * - input: string ("1, 2, 3")
 *
 * Output:
 * - JSON result matching the schema used in the client.
 */
exports.solveSequence = onCall(
  {
    secrets: ['GEMINI_API_KEY'],
    cors: true,
  },
  async (request) => {
    const userInput = request.data.input;

    if (!userInput || typeof userInput !== 'string') {
      throw new Error('Invalid input. Expected a string.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('GEMINI_API_KEY is not set in environment secrets.');
      throw new Error('Server configuration error.');
    }

    // Reuse the exact same Logic/Prompt/Schema as the client to ensure consistency.
    // In a real repo, this might be shared code/package.

    // --- SCHEMA START (Duplicated from client for stability) ---
    const errorSchema = z.object({
      error: z.string().describe('Error message'),
    });

    const digitPatternSchema = z.object({
      type: z.string(),
      rule: z.string(),
      next: z.number(),
      sequenceValues: z.array(z.number()),
      sequenceLabels: z.array(z.string()),
      connections: z
        .array(
          z.object({
            fromIndex: z.number(),
            toIndex: z.number(),
            label: z.string(),
            type: z.enum(['add', 'sub', 'mul', 'pow', 'other']),
          }),
        )
        .optional(),
      isInterleaved: z.boolean(),
      predictions: z.array(z.number()),
    });

    // Note: 'connections' in the client has a preprocessing step for stringified JSON.
    // Since we are running on Node via the official SDK, the model *should* return proper JSON.
    // We will relax the schema slightly here or trust the SDK's JSON mode.

    const providedSchema = z.union([digitPatternSchema, errorSchema]);
    // --- SCHEMA END ---

    const modelName = 'gemini-2.5-flash';
    const prompt = `
    Analyze this number sequence: "${userInput}"
    
    Your tasks:
    1. Identify the pattern type (e.g., Arithmetic, Geometric, Fibonacci, Interleaved)
    2. Explain the rule plain language
    3. Predict the next number
    4. Provide visualization connections
    
    Return strict JSON matching this schema:
    {
       type: string,
       rule: string,
       next: number,
       sequenceValues: number[],
       sequenceLabels: string[],
       isInterleaved: boolean,
       predictions: number[],
       connections: { fromIndex: number, toIndex: number, label: string, type: 'add'|'sub'|'mul'|'pow'|'other' }[]
    }
    `;

    try {
      const client = new GoogleGenAI({ apiKey });

      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: zodToJsonSchema(providedSchema),
        },
      });

      // Parse result
      const text = response.text();
      logger.info('Gemini Raw Response:', text);

      const json = JSON.parse(text);
      return json;
    } catch (error) {
      logger.error('Gemini API Error:', error);
      // Return a structured error to the client
      return {
        error: `Server Error: ${error.message}`,
      };
    }
  },
);
