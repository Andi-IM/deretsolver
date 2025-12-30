import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ErrorNotification from './ErrorNotification';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('ErrorNotification', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorNotification error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message and title when error is provided', () => {
    render(<ErrorNotification error="Invalid sequence" />);
    expect(screen.getByText('input.error_title')).toBeInTheDocument();
    expect(screen.getByText('Invalid sequence')).toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorNotification error="Error" onDismiss={onDismiss} />);
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorNotification error="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
