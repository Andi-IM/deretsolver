import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentationPage from './DocumentationPage';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'documentation.title': 'Documentation & Guide',
        'documentation.how_to_use.title': 'How to Use',
        'documentation.how_to_use.content': 'Enter a sequence...',
        'documentation.api_key.title': 'Complex Patterns & API Key',
        'documentation.supported_patterns.title': 'Supported Patterns',
        'documentation.supported_patterns.arithmetic.name': 'Arithmetic Progression',
        'documentation.supported_patterns.arithmetic.desc': 'Adds/subtracts a constant value',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  Trans: ({ i18nKey }) => (
    // Simple mock for Trans that just returns the key or some content
    // and renders children/components if needed.
    // For this test we just want to see if it renders without crashing
    // and maybe check if the key is passed.
    <span data-testid="trans-component">{i18nKey}</span>
  ),
}));

// Mock firebase
vi.mock('../utils/firebase', () => ({
  analytics: {},
}));

vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
}));

describe('DocumentationPage', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <DocumentationPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Documentation & Guide')).toBeInTheDocument();
    expect(screen.getByText('How to Use')).toBeInTheDocument();
    expect(screen.getByText('Supported Patterns')).toBeInTheDocument();
  });

  it('renders supported patterns', () => {
    render(
      <MemoryRouter>
        <DocumentationPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Arithmetic Progression')).toBeInTheDocument();
    expect(screen.getByText('Adds/subtracts a constant value')).toBeInTheDocument();
  });
});
