import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ApiKeyInput from './ApiKeyInput';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('ApiKeyInput', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(<ApiKeyInput value="" onChange={vi.fn()} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders input when visible is true', () => {
    render(<ApiKeyInput value="" onChange={vi.fn()} visible={true} />);
    expect(screen.getByPlaceholderText('input.api_key_placeholder')).toBeInTheDocument();
    expect(screen.getByText('input.api_key_helper')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<ApiKeyInput value="" onChange={onChange} visible={true} />);
    const input = screen.getByPlaceholderText('input.api_key_placeholder');
    fireEvent.change(input, { target: { value: 'my-api-key' } });
    expect(onChange).toHaveBeenCalledWith('my-api-key');
  });

  it('displays provided value', () => {
    render(<ApiKeyInput value="existing-key" onChange={vi.fn()} visible={true} />);
    expect(screen.getByDisplayValue('existing-key')).toBeInTheDocument();
  });
});
