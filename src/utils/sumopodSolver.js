import { z } from 'zod';

import logger from '@/utils/logger';

/**
 * Solves a number sequence using the SumoPod AI API (OpenAI compatible).
 * @param {string} input - The standard input string (e.g., "1, 2, 3").
 * @param {string} apiKey - The user's SumoPod API Key.
 * @returns {Promise<Object>} - The sequence analysis result or an error object.
 */
const solveWithSumopod = async (input, apiKey) => {
  // Ensure at least 3 numbers are present to avoid junk queries
  const numberMatches = input.match(/[-+]?\d*\.?\d+/g);
  if (!numberMatches || numberMatches.length < 3) {
    return {
      error: 'Please enter at least 3 numbers to identify a pattern.',
    };
  }

  if (!apiKey) {
    return {
      error: 'Please provide a valid SumoPod API Key in the settings to use this AI solver.',
    };
  }

  try {
    const errorSchema = z.object({
      error: z
        .string()
        .describe('Error message when pattern identification fails or input is invalid'),
    });

    const digitPatternSchema = z.object({
      type: z
        .string()
        .describe(
          "Pattern type: 'Arithmetic', 'Geometric', 'Fibonacci', 'Interleaved Arithmetic', etc.",
        ),

      rule: z
        .string()
        .describe('Clear explanation of the pattern logic with mathematical operations'),

      next: z.number().describe('Next predicted number in sequence'),

      sequenceValues: z
        .array(z.number())
        .describe('All sequence values including the prediction at the end'),

      sequenceLabels: z
        .array(z.string())
        .describe("Labels for each value in order, e.g., 'n1', 'n2', 'n3', 'predicted'"),

      connections: z
        .array(
          z.object({
            fromIndex: z.number().describe('Index of the source value in sequenceValues'),
            toIndex: z.number().describe('Index of the target value in sequenceValues'),
            label: z.string().describe("Operation label, e.g., '+3', 'x2'"),
            type: z.enum(['add', 'sub', 'mul', 'pow', 'other']).describe('Type of operation'),
          }),
        )
        .describe('List of connections between values to visualize the pattern logic.'),

      isInterleaved: z
        .boolean()
        .describe('True if the sequence is composed of multiple interleaved sequences'),

      predictions: z
        .array(z.number())
        .describe(
          "If interleaved, provide the next value for EACH sub-sequence. If single pattern, this array contains just the single 'next' value.",
        ),
    });

    const providedSchema = z.union([digitPatternSchema, errorSchema]);

    const model = 'glm-4-7-251222'; // Preferred model based on documentation
    const baseUrl = 'https://ai.sumopod.com/v1/chat/completions';

    const prompt = `
Analyze this number sequence and find the missing value: "${input}"

Example: If input is "1,2,x,8,16", the answer is x=4 because the pattern is 1,2,4,8,16 (multiply by 2).

CRITICAL INSTRUCTIONS:
1. First, find the pattern using ONLY the known numbers (ignore x/?/...)
2. Calculate what x SHOULD be based on the pattern
3. If there is a missing value (x/?...), the "next" field should be the ANSWER to the missing value, NOT the next number after the sequence
4. For "1,2,8,x,64,128", x=16 is the answer, so next should be 16
5. The predictions array should contain the answer to the missing value
6. sequenceValues should have the COMPLETE sequence with x filled in

Return JSON:
{
  "type": "Geometric" or "Arithmetic" etc,
  "rule": "explain the pattern", 
  "next": 16,
  "sequenceValues": [1,2,8,16,64,128],
  "sequenceLabels": ["n1","n2","n3","x","n4","n5"],
  "connections": [{"fromIndex": 0, "toIndex": 1, "label": "×2", "type": "mul"}, ...],
  "isInterleaved": false,
  "predictions": [16]
}

Return ONLY valid JSON.
    `.trim();

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a mathematical sequence expert that outputs only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    logger.debug('Sumopod Raw content:', content);

    content = content
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    let parsedJson = JSON.parse(content);

    if (Array.isArray(parsedJson)) {
      parsedJson = parsedJson[0] || parsedJson[1] || {};
    }

    if (!parsedJson || typeof parsedJson !== 'object') {
      parsedJson = {};
    }

    if (parsedJson.connections && Array.isArray(parsedJson.connections)) {
      const typeMap = {
        add: 'add',
        subtraction: 'sub',
        sub: 'sub',
        subtract: 'sub',
        minus: 'sub',
        multiply: 'mul',
        multiplication: 'mul',
        mul: 'mul',
        times: 'mul',
        '*': 'mul',
        power: 'pow',
        exponent: 'pow',
        pow: 'pow',
        '^': 'pow',
        other: 'other',
        unknown: 'other',
      };
      for (const conn of parsedJson.connections) {
        if (conn.type && typeof conn.type === 'string') {
          conn.type = typeMap[conn.type.toLowerCase()] || 'other';
        }
      }
    }

    const validatedData = providedSchema.parse(parsedJson);

    return validatedData;
  } catch (err) {
    logger.error('Sumopod API Error:', err);
    return {
      error: `Failed to connect to SumoPod AI: ${err.message}`,
    };
  }
};

export default solveWithSumopod;
