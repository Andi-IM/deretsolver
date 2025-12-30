import { MemoryRouter } from 'react-router-dom';

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePageTracking } from './usePageTracking';

// Mock everything
vi.mock('@/utils/firebase', () => ({
  initializeFirebase: vi.fn(() => Promise.resolve({ analytics: { app: {} } })),
}));

vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
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
});
