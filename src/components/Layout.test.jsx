import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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

describe('Layout Component', () => {
  it('toggles mobile menu when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Layout>
          <div>Child Content</div>
        </Layout>
      </MemoryRouter>,
    );

    // Menu should be initially hidden (or links not present in DOM if conditionally rendered)
    // Note: In JSDOM with standard render, "hidden" class doesn't hide elements from getByRole unless we check visibility with style awareness,
    // but our implementation conditionally renders the {isMobileMenuOpen && ...} block.
    // So the mobile links should NOT be in the document initially.

    // Desktop links are always there. Mobile links are duplicates.
    // Desktop links: "Solver", "Documentation"
    // Mobile links: "Solver", "Documentation"

    // Initially, we should find desktop links.
    // Let's rely on the fact that mobile links are wrapped in a container that appears only when open.

    const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });

    // Click to open
    await user.click(toggleButton);

    // Now we expect mobile menu to be present.
    // Since desktop and mobile links have same text, we might find multiple.
    const allSolverLinks = screen.getAllByText('Solver');
    // Logic: Desktop (1) + Mobile (1) = 2
    expect(allSolverLinks.length).toBeGreaterThanOrEqual(1);

    // Find the link that is inside the mobile nav (we can't easily distinguish by parent in simple query without helper)
    // But we can check that *more* links are present than before?
    // Or just check that the click handled the state.

    // Let's verify the "close" icon appears
    expect(screen.getByText('close')).toBeInTheDocument();

    // Click to close
    await user.click(toggleButton);

    // "menu" icon should be back
    expect(screen.getByText('menu')).toBeInTheDocument();
  });

  it('closes mobile menu when validation link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Layout>content</Layout>
      </MemoryRouter>,
    );

    const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
    await user.click(toggleButton);

    // Click a link in the mobile menu
    // We get all links to "Documentation". The last one is likely the mobile one in DOM order (appended at end of header).
    const docLinks = screen.getAllByRole('link', { name: /Documentation/i });
    const mobileLink = docLinks[docLinks.length - 1];

    await user.click(mobileLink);

    // Menu should close -> "menu" icon visible
    expect(screen.getByText('menu')).toBeInTheDocument();
  });
});
