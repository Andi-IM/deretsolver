import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

export default ThemeToggle;
