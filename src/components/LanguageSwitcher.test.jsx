import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('LanguageSwitcher', () => {
  it('renders current language (EN) correctly', () => {
    useTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: 'en', changeLanguage: vi.fn() },
    });

    render(<LanguageSwitcher />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch Language')).toBeInTheDocument();
  });

  it('renders current language (ID) correctly', () => {
    useTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: 'id', changeLanguage: vi.fn() },
    });

    render(<LanguageSwitcher />);
    expect(screen.getByText('ID')).toBeInTheDocument();
  });

  it('toggles language from EN to ID when clicked', () => {
    const changeLanguage = vi.fn();
    useTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: 'en', changeLanguage },
    });

    render(<LanguageSwitcher />);
    const button = screen.getByLabelText('Switch Language');
    fireEvent.click(button);

    expect(changeLanguage).toHaveBeenCalledWith('id');
  });

  it('toggles language from ID to EN when clicked', () => {
    const changeLanguage = vi.fn();
    useTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: 'id', changeLanguage },
    });

    render(<LanguageSwitcher />);
    const button = screen.getByLabelText('Switch Language');
    fireEvent.click(button);

    expect(changeLanguage).toHaveBeenCalledWith('en');
  });
});
