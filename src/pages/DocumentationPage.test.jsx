import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePageTracking } from '@/hooks/usePageTracking';
import DocumentationPage from '@/pages/DocumentationPage';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ i18nKey }) => <span>{i18nKey}</span>,
  // Ensure useTranslation hook is mocked correctly if needed elsewhere,
  // but the simple mock above is usually sufficient for this component structure.
}));

// Mock the usage of the custom hook
vi.mock('@/hooks/usePageTracking', () => ({
  usePageTracking: vi.fn(),
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

  it('should match document title', async () => {
    renderComponent();
    await waitFor(() => {
      expect(document.title).toBe('documentation.title | app.shortname');
    });
  });

  it('should track page view on mount', () => {
    renderComponent();
    expect(usePageTracking).toHaveBeenCalledWith('Documentation');
  });

  it('should render supported patterns list', () => {
    renderComponent();
    // Check for a few pattern keys being rendered via translation mock
    expect(screen.getAllByText(/documentation.supported_patterns./).length).toBeGreaterThan(0);
  });
});
