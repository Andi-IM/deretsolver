import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 dark:text-blue-400'
      : 'hover:text-slate-900 dark:hover:text-white transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 15.75H21a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75h-5.25a.75.75 0 01-.75-.75V16.5a.75.75 0 01.75-.75z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h5.25a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V3.75A.75.75 0 013 3zM3 15.75h5.25a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V16.5a.75.75 0 01.75-.75z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 4.5h.008v.008h-.008V4.5zM16.5 8.25h.008v.008h-.008V8.25zM19.5 4.5h.008v.008h-.008V4.5zM19.5 8.25h.008v.008h-.008V8.25z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Deret Solver
            </h1>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Link className={isActive('/')} to="/">
                Solver
              </Link>
              <Link className={isActive('/quiz')} to="/quiz">
                Quiz Mode
              </Link>
              <Link className={isActive('/docs')} to="/docs">
                Documentation
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <button
                type="button"
                className="sm:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                className={`${isActive('/')} block py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800`}
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solver
              </Link>
              <Link
                className={`${isActive('/quiz')} block py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800`}
                to="/quiz"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quiz Mode
              </Link>
              <Link
                className={`${isActive('/docs')} block py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800`}
                to="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documentation
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              to="/privacy"
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('page.privacy')}
            </Link>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Deret Solver. Mathematics made visual.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This site is protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
