import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import '../index.css';

// Import real i18n instance to verify text changes
import i18n from '../i18n'; // Import i18n instance

describe('Layout Browser Test', () => {
  // Setup common environment
  // eslint-disable-next-line no-undef
  beforeEach(async () => {
    await page.viewport(1024, 768);
    await i18n.changeLanguage('en');
  });

  it('renders navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    // Verify "Documentation" link exists
    const docsLink = page.getByRole('link', { name: 'Documentation' });
    await expect.element(docsLink).toBeInTheDocument();

    // "Solver" matches both the Logo "Deret Solver" and the Nav Interface "Solver"
    // Use exact: true to target the navigation link specifically
    const solverLink = page.getByRole('link', { name: 'Solver', exact: true });
    await expect.element(solverLink).toBeInTheDocument();
  });

  it('changes language and text updates', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    );

    const langButton = page.getByRole('button', { name: /Switch Language/i });

    // Assume start state is EN (default fallback)
    // We expect the button to show "EN"
    await expect.element(langButton).toHaveTextContent('EN');

    // Switch to ID
    await langButton.click();
    await expect.element(langButton).toHaveTextContent('ID');

    // Switch back to EN
    await langButton.click();
    await expect.element(langButton).toHaveTextContent('EN');

    // Take a screenshot to confirm
    await page.screenshot({
      path: 'C:/Users/andii/.gemini/antigravity/brain/19604751-c8dd-404b-bcc9-b301e4b450ff/browser_test_language.png',
    });
  });
});
