import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTheme } from '@/context/ThemeContext';

import ThemeToggle from './ThemeToggle';

// Mock useTheme
vi.mock('@/context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  it('renders moon icon in light mode', () => {
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('renders sun icon in dark mode', () => {
    useTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    const toggleTheme = vi.fn();
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme,
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText('Switch to dark mode'));
    expect(toggleTheme).toHaveBeenCalled();
  });
});
