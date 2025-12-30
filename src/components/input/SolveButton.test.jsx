import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SolveButton from './SolveButton';

describe('SolveButton', () => {
  it('renders with default label', () => {
    render(
      <SolveButton
        onClick={vi.fn()}
        disabled={false}
        isLoading={false}
        label="Solve"
        loadingLabel="Processing"
      />,
    );
    expect(screen.getByText('Solve')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <SolveButton
        onClick={vi.fn()}
        disabled={false}
        isLoading={true}
        label="Solve"
        loadingLabel="Processing"
      />,
    );
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.queryByText('Solve')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <SolveButton
        onClick={onClick}
        disabled={false}
        isLoading={false}
        label="Solve"
        loadingLabel="Processing"
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <SolveButton
        onClick={vi.fn()}
        disabled={true}
        isLoading={false}
        label="Solve"
        loadingLabel="Processing"
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(
      <SolveButton
        onClick={vi.fn()}
        disabled={false}
        isLoading={true}
        label="Solve"
        loadingLabel="Processing"
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
