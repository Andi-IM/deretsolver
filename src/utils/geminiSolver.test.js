import { describe, it, expect, vi, beforeEach } from 'vitest';
import solveWithGemini from './geminiSolver';

// Mock the GoogleGenAI library
const { MockGoogleGenAI } = vi.hoisted(() => ({
  MockGoogleGenAI: vi.fn(class {}),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: MockGoogleGenAI,
}));

// Mock the logger to avoid Firebase initialization during tests
vi.mock('./logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

describe('solveWithGemini', () => {
  const mockApiKey = 'test-api-key';
  const mockInput = '2, 4, 8, 16';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error if API key is missing', async () => {
    const result = await solveWithGemini(mockInput, '');
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Gemini API Key');
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
});
