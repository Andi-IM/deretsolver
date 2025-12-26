import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@vitest/browser';
import InputSection from './InputSection';
import '../index.css'; // Import global styles

// Mock needed for useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('InputSection Browser Test', () => {
  it('renders and interacts in browser', async () => {
    const defaultProps = {
      input: '',
      setInput: vi.fn(),
      onSolve: vi.fn(),
      error: null,
      isLoading: false,
      apiKey: '',
      setApiKey: vi.fn(),
    };

    render(<InputSection {...defaultProps} />);

    // Verify basic rendering using page object from vitest/browser
    const button = page.getByText('input.solve');
    await expect.element(button).toBeInTheDocument();
  });
});
