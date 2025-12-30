import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SequenceInput from './SequenceInput';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('SequenceInput', () => {
  it('renders textarea with label', () => {
    render(<SequenceInput value="" onChange={vi.fn()} hasError={false} />);
    expect(screen.getByText('input.label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('input.placeholder')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<SequenceInput value="" onChange={onChange} hasError={false} />);
    const textarea = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(textarea, { target: { value: '1, 2, 3' } });
    expect(onChange).toHaveBeenCalledWith('1, 2, 3');
  });

  it('displays provided value', () => {
    render(<SequenceInput value="5, 10, 15" onChange={vi.fn()} hasError={false} />);
    expect(screen.getByDisplayValue('5, 10, 15')).toBeInTheDocument();
  });

  it('applies error styling when hasError is true', () => {
    render(<SequenceInput value="" onChange={vi.fn()} hasError={true} />);
    const textarea = screen.getByPlaceholderText('input.placeholder');
    expect(textarea).toHaveClass('border-red-300');
  });
});
