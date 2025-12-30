import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Layout from '@/components/Layout';

// Mock language switcher to avoid complex setup
vi.mock('@/components/LanguageSwitcher', () => ({
  default: () => <button type="button">Switch Language</button>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Layout>
        <div>Child Content</div>
      </Layout>
    </MemoryRouter>,
  );
};

describe('Layout Component', () => {
  describe('Header and Navigation', () => {
    it('renders logo and app title', () => {
      renderWithRouter();
      expect(screen.getByText('Deret Solver')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Deret Solver/i })).toHaveAttribute('href', '/');
    });

    it('renders desktop navigation links', () => {
      renderWithRouter();
      expect(screen.getByRole('link', { name: 'Solver' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Quiz Mode' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Documentation' })).toBeInTheDocument();
    });

    it('highlights active link for Solver page', () => {
      renderWithRouter('/');
      const solverLinks = screen.getAllByRole('link', { name: 'Solver' });
      // Desktop nav link should have active class
      expect(solverLinks[0]).toHaveClass('text-blue-600');
    });

    it('highlights active link for Quiz page', () => {
      renderWithRouter('/quiz');
      const quizLinks = screen.getAllByRole('link', { name: 'Quiz Mode' });
      expect(quizLinks[0]).toHaveClass('text-blue-600');
    });

    it('highlights active link for Documentation page', () => {
      renderWithRouter('/docs');
      const docLinks = screen.getAllByRole('link', { name: 'Documentation' });
      expect(docLinks[0]).toHaveClass('text-blue-600');
    });

    it('applies hover styles to inactive links', () => {
      renderWithRouter('/');
      const docLinks = screen.getAllByRole('link', { name: 'Documentation' });
      // Inactive link should have hover transition class
      expect(docLinks[0]).toHaveClass('transition-colors');
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });

      // Click to open
      await user.click(toggleButton);

      // Mobile menu should be visible - check for close icon
      expect(screen.getByText('close')).toBeInTheDocument();

      // Verify we have duplicate links (desktop + mobile)
      const solverLinks = screen.getAllByText('Solver');
      expect(solverLinks.length).toBe(2);

      // Click to close
      await user.click(toggleButton);

      // Menu icon should be back
      expect(screen.getByText('menu')).toBeInTheDocument();
    });

    it('closes mobile menu when Solver link is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
      await user.click(toggleButton);

      // Click mobile Solver link (last one in DOM)
      const solverLinks = screen.getAllByRole('link', { name: 'Solver' });
      await user.click(solverLinks[solverLinks.length - 1]);

      expect(screen.getByText('menu')).toBeInTheDocument();
    });

    it('closes mobile menu when Quiz Mode link is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
      await user.click(toggleButton);

      const quizLinks = screen.getAllByRole('link', { name: 'Quiz Mode' });
      await user.click(quizLinks[quizLinks.length - 1]);

      expect(screen.getByText('menu')).toBeInTheDocument();
    });

    it('closes mobile menu when Documentation link is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
      await user.click(toggleButton);

      const docLinks = screen.getAllByRole('link', { name: 'Documentation' });
      await user.click(docLinks[docLinks.length - 1]);

      expect(screen.getByText('menu')).toBeInTheDocument();
    });
  });

  describe('Main Content', () => {
    it('renders children in main area', () => {
      renderWithRouter();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders copyright text with current year', () => {
      renderWithRouter();
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    it('renders privacy policy link', () => {
      renderWithRouter();
      const privacyLink = screen.getByRole('link', { name: 'page.privacy' });
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('renders Google Privacy Policy external link', () => {
      renderWithRouter();
      const googlePrivacy = screen.getByRole('link', { name: 'Privacy Policy' });
      expect(googlePrivacy).toHaveAttribute('href', 'https://policies.google.com/privacy');
      expect(googlePrivacy).toHaveAttribute('target', '_blank');
      expect(googlePrivacy).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders Google Terms of Service external link', () => {
      renderWithRouter();
      const googleTerms = screen.getByRole('link', { name: 'Terms of Service' });
      expect(googleTerms).toHaveAttribute('href', 'https://policies.google.com/terms');
      expect(googleTerms).toHaveAttribute('target', '_blank');
      expect(googleTerms).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders reCAPTCHA notice text', () => {
      renderWithRouter();
      expect(screen.getByText(/This site is protected by reCAPTCHA/)).toBeInTheDocument();
    });
  });
});
