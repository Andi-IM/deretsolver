import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('PrivacyPolicyPage', () => {
  it('should render privacy policy page title', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.title')).toBeInTheDocument();
  });

  it('should render introduction section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.introduction.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.introduction.content')).toBeInTheDocument();
  });

  it('should render information collection section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.information_collection.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.information_collection.intro')).toBeInTheDocument();
  });

  it('should render usage data details', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.information_collection.usage_data.title')).toBeInTheDocument();
  });

  it('should render analytics data details', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(
      screen.getByText('privacy.information_collection.analytics_data.title'),
    ).toBeInTheDocument();
  });

  it('should render technical data details', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(
      screen.getByText('privacy.information_collection.technical_data.title'),
    ).toBeInTheDocument();
  });

  it('should render information usage section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.information_usage.title')).toBeInTheDocument();
  });

  it('should render data security section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.data_security.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.data_security.content')).toBeInTheDocument();
  });

  it('should render third party section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.third_party.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.third_party.google_analytics.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.third_party.recaptcha.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.third_party.firebase.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.third_party.gemini_api.title')).toBeInTheDocument();
  });

  it('should render cookies section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.cookies.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.cookies.content')).toBeInTheDocument();
  });

  it('should render user rights section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.user_rights.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.user_rights.access')).toBeInTheDocument();
  });

  it('should render children section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.children.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.children.content')).toBeInTheDocument();
  });

  it('should render policy changes section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.policy_changes.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.last_updated')).toBeInTheDocument();
  });

  it('should render contact section', () => {
    renderWithRouter(<PrivacyPolicyPage />);
    expect(screen.getByText('privacy.contact.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.contact.content')).toBeInTheDocument();
  });
});
