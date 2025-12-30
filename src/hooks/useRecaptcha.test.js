import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import logger from '@/utils/logger';

import useRecaptcha, { defaultLoadRecaptchaScript } from './useRecaptcha';

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useRecaptcha Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.grecaptcha
    window.grecaptcha = undefined;

    // Clean up document head
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('defaultLoadRecaptchaScript', () => {
    it('should resolve immediately if window.grecaptcha exists', async () => {
      window.grecaptcha = {};
      await expect(defaultLoadRecaptchaScript()).resolves.toBeUndefined();
    });

    it('should inject script tag and resolve on load', async () => {
      const promise = defaultLoadRecaptchaScript();

      const script = document.head.querySelector('script');
      expect(script).toBeTruthy();
      // Loose check to allow undefined env var in tests
      expect(script.src).toContain('recaptcha/api.js');
      expect(script.src).toContain('render=');
      expect(script.async).toBe(true);

      // Simulate script load
      // Mock window.grecaptcha.ready
      window.grecaptcha = { ready: (cb) => cb() };
      script.onload();

      await expect(promise).resolves.toBeUndefined();
    });

    it('should resolve strictly if window.grecaptcha.ready is missing', async () => {
      const promise = defaultLoadRecaptchaScript();
      const script = document.head.querySelector('script');

      // Simulate script load without grecaptcha object populated fully
      script.onload();

      await expect(promise).resolves.toBeUndefined();
    });

    it('should reject on script error', async () => {
      const promise = defaultLoadRecaptchaScript();
      const script = document.head.querySelector('script');

      const error = new Error('Load failed');
      script.onerror(error);

      await expect(promise).rejects.toThrow(error);
    });
  });

  describe('useRecaptcha', () => {
    it('should load script and set ready state on success', async () => {
      // Mock successful loader
      const mockLoader = vi.fn().mockResolvedValue();

      const { result } = renderHook(() => useRecaptcha(mockLoader));

      expect(mockLoader).toHaveBeenCalled();
      expect(result.current.recaptchaReady).toBe(false);

      await waitFor(() => {
        expect(result.current.recaptchaReady).toBe(true);
      });

      expect(logger.info).toHaveBeenCalledWith('reCAPTCHA loaded successfully');
    });

    it('should log error on script load failure', async () => {
      const error = new Error('Failed');
      const mockLoader = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useRecaptcha(mockLoader));

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Failed to load reCAPTCHA script:', error);
      });

      expect(result.current.recaptchaReady).toBe(false);
    });

    it('should not update state if unmounted during load', async () => {
      let resolveLoader;
      const mockLoader = vi.fn().mockImplementation(() => new Promise((r) => (resolveLoader = r)));

      const { unmount } = renderHook(() => useRecaptcha(mockLoader));

      unmount();
      resolveLoader();

      // Wait a bit to ensure potential state updates would have happened
      await new Promise((r) => setTimeout(r, 0));

      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should use default loader if none provided', async () => {
      const { result } = renderHook(() => useRecaptcha());

      // Check if script creation started (async effect)
      await waitFor(() => {
        expect(document.head.querySelector('script')).toBeTruthy();
      });

      const script = document.head.querySelector('script');
      // Simulate successful load logic for default loader
      window.grecaptcha = { ready: (cb) => cb() };
      script.onload();

      await waitFor(() => {
        expect(result.current.recaptchaReady).toBe(true);
      });
    });

    describe('getRecaptchaToken', () => {
      it('should return null and warn if not ready', async () => {
        const mockLoader = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
        const { result } = renderHook(() => useRecaptcha(mockLoader));

        const token = await result.current.getRecaptchaToken();

        expect(token).toBeNull();
        expect(logger.warn).toHaveBeenCalledWith('reCAPTCHA not ready, skipping token generation');
      });

      it('should return null if window.grecaptcha is missing even if ready (edge case)', async () => {
        const mockLoader = vi.fn().mockResolvedValue();
        const { result } = renderHook(() => useRecaptcha(mockLoader));

        await waitFor(() => expect(result.current.recaptchaReady).toBe(true));

        // Ensure window.grecaptcha is missing
        window.grecaptcha = undefined;

        const token = await result.current.getRecaptchaToken();
        expect(token).toBeNull();
        expect(logger.warn).toHaveBeenCalledWith('reCAPTCHA not ready, skipping token generation');
      });

      it('should return token on successful execution', async () => {
        const mockToken = 'mock-token';
        const executeMock = vi.fn().mockResolvedValue(mockToken);
        window.grecaptcha = { execute: executeMock };

        const mockLoader = vi.fn().mockResolvedValue();
        const { result } = renderHook(() => useRecaptcha(mockLoader));

        await waitFor(() => expect(result.current.recaptchaReady).toBe(true));

        const token = await result.current.getRecaptchaToken();

        expect(executeMock).toHaveBeenCalledWith(expect.anything(), { action: 'submit_feedback' });
        expect(token).toBe(mockToken);
      });

      it('should return null and log error on execution failure', async () => {
        const error = new Error('Execute failed');
        const executeMock = vi.fn().mockRejectedValue(error);
        window.grecaptcha = { execute: executeMock };

        const mockLoader = vi.fn().mockResolvedValue();
        const { result } = renderHook(() => useRecaptcha(mockLoader));

        await waitFor(() => expect(result.current.recaptchaReady).toBe(true));

        const token = await result.current.getRecaptchaToken();

        expect(token).toBeNull();
        expect(logger.error).toHaveBeenCalledWith('Failed to execute reCAPTCHA:', error);
      });
    });
  });
});
