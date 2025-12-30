import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import InputHelperBar from './InputHelperBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => (options?.count !== undefined ? `${key}: ${options.count}` : key),
  }),
}));

describe('InputHelperBar', () => {
  it('renders helper text', () => {
    render(<InputHelperBar itemCount={0} apiKeySet={false} onApiKeyToggle={vi.fn()} />);
    expect(screen.getByText('input.helper')).toBeInTheDocument();
  });

  it('displays item count', () => {
    render(<InputHelperBar itemCount={5} apiKeySet={false} onApiKeyToggle={vi.fn()} />);
    expect(screen.getByText('input.items_count: 5')).toBeInTheDocument();
  });

  it('shows add API key text when apiKeySet is false', () => {
    render(<InputHelperBar itemCount={0} apiKeySet={false} onApiKeyToggle={vi.fn()} />);
    expect(screen.getByText('input.add_api_key')).toBeInTheDocument();
  });

  it('shows API key set text when apiKeySet is true', () => {
    render(<InputHelperBar itemCount={0} apiKeySet={true} onApiKeyToggle={vi.fn()} />);
    expect(screen.getByText('input.api_key_set')).toBeInTheDocument();
  });

  it('calls onApiKeyToggle when toggle button is clicked', () => {
    const onApiKeyToggle = vi.fn();
    render(<InputHelperBar itemCount={0} apiKeySet={false} onApiKeyToggle={onApiKeyToggle} />);
    fireEvent.click(screen.getByText('input.add_api_key'));
    expect(onApiKeyToggle).toHaveBeenCalled();
  });
});
