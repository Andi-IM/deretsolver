import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DocumentationPage from '@/pages/DocumentationPage';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ i18nKey }) => <span>{i18nKey}</span>,
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock('@/utils/firebase', () => ({
  initializeFirebase: vi.fn(() => Promise.resolve({ analytics: {} })),
}));

// Mock firebase/analytics
vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
}));

describe('DocumentationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <DocumentationPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

  it('should render documentation title', () => {
    renderComponent();
    // Use getAllByText since title appears in both Helmet (managed by HelmetProvider) and h2
    // Or just check that at least one is present
    const titles = screen.getAllByText('documentation.title');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('should render all documentation sections', () => {
    renderComponent();

    // Check for section headers
    expect(screen.getByText('documentation.introduction.title')).toBeInTheDocument();
    expect(screen.getByText('documentation.how_to_use.title')).toBeInTheDocument();
    expect(screen.getByText('documentation.recognition_guide.title')).toBeInTheDocument();
    expect(screen.getByText('documentation.supported_patterns.title')).toBeInTheDocument();
    expect(screen.getByText('documentation.api_key.title')).toBeInTheDocument();
  });

  it('should initialize firebase analytics on mount', async () => {
    const { initializeFirebase } = await import('@/utils/firebase');

    renderComponent();

    // Check if initial firebase call happens
    await waitFor(() => {
      expect(initializeFirebase).toHaveBeenCalled();
    });
  });

  it('should update document title', async () => {
    renderComponent();
    await waitFor(() => {
      expect(document.title).toBe('documentation.title | app.shortname');
    });
  });

  it('should handle analytics error gracefully', async () => {
    const logger = await import('@/utils/logger');
    const firebase = await import('@/utils/firebase');

    // Mock failure
    firebase.initializeFirebase.mockRejectedValueOnce(new Error('Firebase init failed'));

    renderComponent();

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to log analytics for Documentation:',
        expect.any(Error),
      );
    });
  });

  it('should render supported patterns list', () => {
    renderComponent();
    // Check for a few pattern keys being rendered via translation mock
    expect(screen.getAllByText(/documentation.supported_patterns./).length).toBeGreaterThan(0);
  });
});
