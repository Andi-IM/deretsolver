import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
      aria-label="Switch Language"
    >
      <span className="material-symbols-outlined text-lg">language</span>
      <span className="uppercase">{i18n.language === 'en' ? 'EN' : 'ID'}</span>
    </button>
  );
}

export default LanguageSwitcher;
