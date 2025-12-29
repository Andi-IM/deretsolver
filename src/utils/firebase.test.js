import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getFirebaseAnalytics,
  getFirebaseApp,
  getFirebaseDB,
  initializeFirebase,
  resetFirebaseState,
} from '@/utils/firebase';

describe('firebase', () => {
  // Mock Firebase SDK modules
  const mockApp = { name: 'mock-app' };
  const mockAnalytics = { name: 'mock-analytics' };
  const mockDb = { name: 'mock-db' };

  const mockLoader = {
    loadApp: vi.fn(() =>
      Promise.resolve({
        initializeApp: vi.fn(() => mockApp),
      }),
    ),
    loadAnalytics: vi.fn(() =>
      Promise.resolve({
        getAnalytics: vi.fn(() => mockAnalytics),
      }),
    ),
    loadFirestore: vi.fn(() =>
      Promise.resolve({
        getFirestore: vi.fn(() => mockDb),
      }),
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetFirebaseState();
  });

  afterEach(() => {
    resetFirebaseState();
  });

  it('should initialize Firebase with injected loader', async () => {
    const result = await initializeFirebase({ loader: mockLoader });

    expect(mockLoader.loadApp).toHaveBeenCalled();
    expect(mockLoader.loadAnalytics).toHaveBeenCalled();
    expect(mockLoader.loadFirestore).toHaveBeenCalled();

    expect(result.app).toBe(mockApp);
    expect(result.analytics).toBe(mockAnalytics);
    expect(result.db).toBe(mockDb);
  });

  it('should return singleton on subsequent calls', async () => {
    const result1 = await initializeFirebase({ loader: mockLoader });
    const result2 = await initializeFirebase({ loader: mockLoader });

    expect(result1).toBe(result2);
    // Loader should only be called once
    expect(mockLoader.loadApp).toHaveBeenCalledTimes(1);
  });

  it('should allow force reinit for testing', async () => {
    await initializeFirebase({ loader: mockLoader });
    await initializeFirebase({ loader: mockLoader, forceReinit: true });

    // Loader called twice due to forceReinit
    expect(mockLoader.loadApp).toHaveBeenCalledTimes(2);
  });

  it('should expose getters after initialization', async () => {
    await initializeFirebase({ loader: mockLoader });

    expect(getFirebaseApp()).toBe(mockApp);
    expect(getFirebaseAnalytics()).toBe(mockAnalytics);
    expect(getFirebaseDB()).toBe(mockDb);
  });

  it('should return null from getters before initialization', () => {
    expect(getFirebaseApp()).toBeNull();
    expect(getFirebaseAnalytics()).toBeNull();
    expect(getFirebaseDB()).toBeNull();
  });

  it('should reset state properly', async () => {
    await initializeFirebase({ loader: mockLoader });
    expect(getFirebaseApp()).toBe(mockApp);

    resetFirebaseState();

    expect(getFirebaseApp()).toBeNull();
    expect(getFirebaseAnalytics()).toBeNull();
    expect(getFirebaseDB()).toBeNull();
  });

  it('should handle loader errors gracefully', async () => {
    const errorLoader = {
      loadApp: vi.fn(() => Promise.reject(new Error('Network error'))),
      loadAnalytics: vi.fn(() => Promise.resolve({})),
      loadFirestore: vi.fn(() => Promise.resolve({})),
    };

    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(initializeFirebase({ loader: errorLoader })).rejects.toThrow('Network error');

    vi.restoreAllMocks();
  });

  it('should use custom config when provided', async () => {
    const customConfig = { apiKey: 'test-key', projectId: 'test-project' };
    let capturedConfig = null;

    const configCapturingLoader = {
      loadApp: vi.fn(() =>
        Promise.resolve({
          initializeApp: vi.fn((config) => {
            capturedConfig = config;
            return mockApp;
          }),
        }),
      ),
      loadAnalytics: vi.fn(() =>
        Promise.resolve({
          getAnalytics: vi.fn(() => mockAnalytics),
        }),
      ),
      loadFirestore: vi.fn(() =>
        Promise.resolve({
          getFirestore: vi.fn(() => mockDb),
        }),
      ),
    };

    await initializeFirebase({ loader: configCapturingLoader, config: customConfig });

    expect(capturedConfig).toEqual(customConfig);
  });
});
