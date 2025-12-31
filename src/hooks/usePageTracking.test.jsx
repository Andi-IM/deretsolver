import { MemoryRouter } from 'react-router-dom';

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePageTracking } from './usePageTracking';

// Mock everything
vi.mock('@/utils/firebase', () => ({
  initializeFirebase: vi.fn(() => Promise.resolve({ analytics: { app: {} } })),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('usePageTracking', () => {
  it('should call logEvent when rendered', async () => {
    const { logEvent } = await import('firebase/analytics');
    const pageTitle = 'Test Page';

    renderHook(() => usePageTracking(pageTitle), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    // Wait for the async logic in useEffect
    await vi.waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'page_view',
        expect.objectContaining({
          page_title: pageTitle,
        }),
      );
    });
  });
  it('should log error if firebase initialization fails', async () => {
    const { initializeFirebase } = await import('@/utils/firebase');
    const logger = (await import('@/utils/logger')).default;
    const pageTitle = 'Error Page';

    initializeFirebase.mockRejectedValueOnce(new Error('Firebase init failed'));

    renderHook(() => usePageTracking(pageTitle), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    await vi.waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to log analytics for ${pageTitle}:`,
        expect.any(Error),
      );
    });
  });
});
