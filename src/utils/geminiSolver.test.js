import { describe, it, expect, vi, beforeEach } from "vitest";
import { solveWithGemini } from "./geminiSolver";
import { GoogleGenAI } from "@google/genai";

// Mock the GoogleGenAI library
vi.mock("@google/genai");

describe("solveWithGemini", () => {
  const mockApiKey = "test-api-key";
  const mockInput = "2, 4, 8, 16";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error if API key is missing", async () => {
    const result = await solveWithGemini(mockInput, "");
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Gemini API Key");
  });

  it("handles successful API response", async () => {
    const mockResultData = {
      type: "Geometric Sequence",
      rule: "Multiply by 2",
      next: 32,
      sequenceValues: [2, 4, 8, 16, 32],
      sequenceLabels: ["n1", "n2", "n3", "n4", "n5"],
      connections: [],
      isInterleaved: false,
      predictions: [32],
    };

    const mockResponse = {
      text: JSON.stringify(mockResultData),
    };

    // Setup the mock chain: new GoogleGenAI() -> client.models.generateContent()
    const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
    const mockClient = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    // Mock implementation must be a function that can be called with 'new'
    GoogleGenAI.mockImplementation(function () {
      return mockClient;
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result).not.toHaveProperty("error");
    expect(result.type).toBe("Geometric Sequence");
    expect(result.next).toBe(32);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
  });

  it("handles API error gracefully", async () => {
    // Setup mock to reject
    const mockGenerateContent = vi
      .fn()
      .mockRejectedValue(new Error("Network Error"));
    const mockClient = {
      models: {
        generateContent: mockGenerateContent,
      },
    };
    GoogleGenAI.mockImplementation(function () {
      return mockClient;
    });

    const result = await solveWithGemini(mockInput, mockApiKey);

    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Failed to connect");
    expect(result.error).toContain("Network Error");
  });
});
