import { beforeEach, describe, expect, it, vi } from 'vitest';

import solveWithSumopod from './sumopodSolver';

describe('solveWithSumopod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('returns error for too few numbers', async () => {
    const result = await solveWithSumopod('1, 2', 'test-key');
    expect(result.error).toContain('at least 3 numbers');
  });

  it('returns error when no API key provided', async () => {
    const result = await solveWithSumopod('1, 2, 3', '');
    expect(result.error).toContain('provide a valid SumoPod API Key');
  });

  it('successfully parses valid SumoPod response', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              type: 'Arithmetic',
              rule: 'Add 2',
              next: 8,
              sequenceValues: [2, 4, 6, 8],
              sequenceLabels: ['n1', 'n2', 'n3', 'predicted'],
              connections: [
                { fromIndex: 0, toIndex: 1, label: '+2', type: 'add' },
                { fromIndex: 1, toIndex: 2, label: '+2', type: 'add' },
                { fromIndex: 2, toIndex: 3, label: '+2', type: 'add' },
              ],
              isInterleaved: false,
              predictions: [8],
            }),
          },
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await solveWithSumopod('2, 4, 6', 'test-key');

    expect(result.type).toBe('Arithmetic');
    expect(result.next).toBe(8);
    expect(result.predictions).toEqual([8]);
  });

  it('handles API errors gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API Key' } }),
    });

    const result = await solveWithSumopod('2, 4, 6', 'invalid-key');
    expect(result.error).toContain('Invalid API Key');
  });
});
