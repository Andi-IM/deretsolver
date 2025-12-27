import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Layout({ children }) {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-600' : 'hover:text-slate-900 transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100">
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
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Deret Solver</h1>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-700">
              <Link className={isActive('/')} to="/">
                Solver
              </Link>
              <Link className={isActive('/docs')} to="/docs">
                Documentation
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button type="button" className="sm:hidden p-2 text-slate-700">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to="/privacy" className="text-slate-600 hover:text-blue-600 transition-colors">
              {t('page.privacy')}
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Deret Solver. Mathematics made visual.
          </p>
          <p className="text-xs text-slate-600">
            This site is protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-800"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-800"
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
