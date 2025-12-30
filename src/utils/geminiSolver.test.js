import { beforeEach, describe, expect, it, vi } from 'vitest';

import solveWithGemini from '@/utils/geminiSolver';

// Mock the GoogleGenAI library
const { MockGoogleGenAI } = vi.hoisted(() => ({
  MockGoogleGenAI: vi.fn(class {}),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: MockGoogleGenAI,
}));

// Mock the logger to avoid Firebase initialization during tests
vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

// Mock Firebase Utils
vi.mock('@/utils/firebase', () => ({
  // getFirebaseFunctions is removed
}));

describe('solveWithGemini', () => {
  const mockApiKey = 'test-api-key';
  const mockInput = '2, 4, 8, 16';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error if input contains fewer than 3 numbers', async () => {
    const result = await solveWithGemini('1, 2', mockApiKey);
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Please enter at least 3 numbers');
  });

  it('returns error if API key is missing', async () => {
    const result = await solveWithGemini('1, 2, 3', '');
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Please provide a valid Gemini API Key');
  });

  it('handles successful API response', async () => {
    const mockResultData = {
      type: 'Geometric Sequence',
      rule: 'Multiply by 2',
      next: 32,
      sequenceValues: [2, 4, 8, 16, 32],
      sequenceLabels: ['n1', 'n2', 'n3', 'n4', 'n5'],
      connections: [],
      isInterleaved: false,
      predictions: [32],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    // Setup the mock chain: new GoogleGenAI() -> client.models.generateContent()
    const mockGenerateContent = vi.fn(async () => mockResponse);

    // eslint-disable-next-line prefer-arrow-callback
    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result).not.toHaveProperty('error');
    expect(result.type).toBe('Geometric Sequence');
    expect(result.next).toBe(32);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(MockGoogleGenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
  });

  it('handles API error gracefully', async () => {
    // Setup mock to reject
    const mockGenerateContent = vi.fn(async () => {
      throw new Error('Network Error');
    });

    // eslint-disable-next-line prefer-arrow-callback
    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Failed to connect to Gemini API');
    expect(result.error).toContain('Network Error');
  });

  it('handles interleaved sequence response', async () => {
    const mockResultData = {
      type: 'Interleaved Sequence',
      rule: 'Two sequences: +1 and +10',
      next: 30,
      sequenceValues: [1, 10, 2, 20, 3, 30, 4],
      sequenceLabels: ['n1', 'n2', 'n3', 'n4', 'n5', 'pred1', 'pred2'],
      connections: [],
      isInterleaved: true,
      predictions: [30, 4],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    const mockGenerateContent = vi.fn(async () => mockResponse);

    // eslint-disable-next-line prefer-arrow-callback
    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result).not.toHaveProperty('error');
    expect(result.isInterleaved).toBe(true);
    expect(result.predictions).toEqual([30, 4]);
  });

  it('handles connections preprocessing', async () => {
    const mockResultData = {
      type: 'Arithmetic Sequence',
      rule: 'Add 2',
      next: 10,
      sequenceValues: [2, 4, 6, 8, 10],
      sequenceLabels: ['n1', 'n2', 'n3', 'n4', 'n5'],
      connections: [
        { fromIndex: 0, toIndex: 1, label: '+2', type: 'add' },
        { fromIndex: 1, toIndex: 2, label: '+2', type: 'add' },
      ],
      isInterleaved: false,
      predictions: [10],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    const mockGenerateContent = vi.fn(async () => mockResponse);

    // eslint-disable-next-line prefer-arrow-callback
    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result.connections).toBeDefined();
    expect(result.connections.length).toBe(2);
  });

  it('handles corrupted connection items gracefully', async () => {
    // Import logger to spy on it
    const logger = await import('@/utils/logger');
    const loggerErrorSpy = vi.spyOn(logger.default, 'error');

    const mockResultData = {
      type: 'Arithmetic Sequence',
      rule: 'Add 2',
      next: 10,
      sequenceValues: [2, 4, 6, 8, 10],
      sequenceLabels: ['n1', 'n2', 'n3', 'n4', 'n5'],
      connections: [
        'invalid-json-string', // This should trigger the catch block in preprocess
        { fromIndex: 0, toIndex: 1, label: '+2', type: 'add' },
      ],
      isInterleaved: false,
      predictions: [10],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    const mockGenerateContent = vi.fn(async () => mockResponse);

    // eslint-disable-next-line prefer-arrow-callback
    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    // The preprocess catch block logs an error
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed to parse connection item:',
      'invalid-json-string',
      expect.any(Error),
    );

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed to parse connection item:',
      'invalid-json-string',
      expect.any(Error),
    );

    // Because the item remains a string, Zod validation fails for the entire schema
    // and returns a generic error object
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Failed to connect to Gemini API');
  });

  it('handles non-array connections (L79 coverage)', async () => {
    // Tests the path where Array.isArray(val) is false
    const mockResultData = {
      type: 'Arithmetic Sequence',
      rule: 'Add 2',
      next: 10,
      sequenceValues: [2, 4, 6, 8, 10],
      sequenceLabels: ['n1', 'n2', 'n3', 'n4', 'n5'],
      connections: 'not-an-array', // Force L79
      isInterleaved: false,
      predictions: [10],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    const mockGenerateContent = vi.fn(async () => mockResponse);

    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    // Should fail schema validation because connections must be array
    expect(result).toHaveProperty('error');
  });

  it('handles timeout when API takes longer than 3000ms', async () => {
    vi.useFakeTimers();

    const mockGenerateContent = vi.fn(async () => {
      // Return a promise that never resolves (or resolves after a long time)
      return new Promise((resolve) => setTimeout(resolve, 5000));
    });

    MockGoogleGenAI.mockImplementation(function mockConstructor() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    // Start the promise
    const promise = solveWithGemini(mockInput, mockApiKey);

    // Fast-forward time
    vi.advanceTimersByTime(3001);

    const result = await promise;

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Timeout: AI took longer than 3000ms');

    vi.useRealTimers();
  });
});
