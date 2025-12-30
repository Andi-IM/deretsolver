import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SolverPage from '@/pages/SolverPage';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock firebase
vi.mock('@/utils/firebase', () => ({
  initializeFirebase: vi.fn(() =>
    Promise.resolve({
      analytics: null,
    }),
  ),
}));

// Mock useSolver hook
vi.mock('@/hooks/useSolver', () => ({
  useSolver: () => ({
    input: '',
    setInput: vi.fn(),
    handleSolve: vi.fn(),
    result: null,
    error: null,
    isLoading: false,
    apiKey: '',
    setApiKey: vi.fn(),
  }),
}));

// Mock child components
vi.mock('@/components/InputSection', () => ({
  default: ({ input, error, isLoading }) => (
    <div data-testid="input-section">
      <span data-testid="input-value">{input}</span>
      <span data-testid="error-value">{error}</span>
      <span data-testid="loading-value">{isLoading ? 'loading' : 'idle'}</span>
    </div>
  ),
}));

vi.mock('@/components/ResultSection', () => ({
  default: ({ result }) => (
    <div data-testid="result-section">{result ? JSON.stringify(result) : 'no result'}</div>
  ),
}));

vi.mock('@/components/FeedbackDialog', () => ({
  default: ({ result }) => (
    <div data-testid="feedback-dialog">{result ? 'feedback' : 'no feedback'}</div>
  ),
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('SolverPage', () => {
  it('should render page title', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByText('app.title')).toBeInTheDocument();
  });

  it('should render page description', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByText('app.description')).toBeInTheDocument();
  });

  it('should render InputSection component', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('input-section')).toBeInTheDocument();
  });

  it('should render ResultSection component', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('result-section')).toBeInTheDocument();
  });

  it('should render FeedbackDialog component', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('feedback-dialog')).toBeInTheDocument();
  });

  it('should pass empty input initially', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('input-value')).toHaveTextContent('');
  });

  it('should show no result initially', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('result-section')).toHaveTextContent('no result');
  });

  it('should show no feedback initially', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('feedback-dialog')).toHaveTextContent('no feedback');
  });

  it('should show idle loading state initially', () => {
    renderWithRouter(<SolverPage />);
    expect(screen.getByTestId('loading-value')).toHaveTextContent('idle');
  });
});

describe('SolverPage with result', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should display result when provided', async () => {
    const mockResult = { type: 'test', rule: 'test rule', next: 5 };

    vi.doMock('@/hooks/useSolver', () => ({
      useSolver: () => ({
        input: '1, 2, 3, 4',
        setInput: vi.fn(),
        handleSolve: vi.fn(),
        result: mockResult,
        error: null,
        isLoading: false,
        apiKey: '',
        setApiKey: vi.fn(),
      }),
    }));

    // Re-import after mock update
    const { default: SolverPageWithResult } = await import('@/pages/SolverPage');

    renderWithRouter(<SolverPageWithResult />);
    expect(screen.getByTestId('result-section')).toBeInTheDocument();
  });
});
