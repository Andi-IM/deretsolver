import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from '@/App';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
  HelmetProvider: ({ children }) => <>{children}</>,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  Trans: ({ children, i18nKey }) => <span>{i18nKey || children}</span>,
  I18nextProvider: ({ children }) => <>{children}</>,
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
      db: {},
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

// Mock quizGenerator
vi.mock('@/utils/quizGenerator', () => ({
  generateQuestion: vi.fn(() => ({
    sequence: [2, 4, 6, 8],
    options: [10, 11, 12, 14],
    correctAnswer: 10,
    rule: { key: 'quiz.rules.arithmetic', data: { diff: 2 } },
    explanation: {
      key: 'quiz.explanations.arithmetic',
      data: { action: 'increases', absDiff: 2, last: 8, sign: '+', next: 10 },
    },
  })),
}));

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
};

describe('App', () => {
  it('should render without crashing', () => {
    renderWithRouter();
    expect(document.body).toBeDefined();
  });

  it('should render solver page on root route', () => {
    renderWithRouter('/');
    expect(screen.getByText('app.title')).toBeInTheDocument();
  });

  it('should render documentation page on /docs route', () => {
    renderWithRouter('/docs');
    expect(screen.getByText('documentation.title')).toBeInTheDocument();
  });

  it('should render quiz page on /quiz route', () => {
    renderWithRouter('/quiz');
    expect(screen.getByText('quiz.title')).toBeInTheDocument();
  });

  it('should render privacy page on /privacy route', () => {
    renderWithRouter('/privacy');
    expect(screen.getByText('privacy.title')).toBeInTheDocument();
  });

  it('should render Layout wrapper on all pages', () => {
    renderWithRouter('/');
    // Layout should include footer with privacy link
    expect(screen.getByText('page.privacy')).toBeInTheDocument();
  });
});
