import { useTranslation } from 'react-i18next';

function ErrorNotification({ error, onDismiss }) {
  const { t } = useTranslation();

  if (!error) return null;

  return (
    <div className="relative z-10 mb-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg p-4 flex items-start justify-between animate-trans-y-in">
      <div className="flex gap-3">
        <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[16px] font-bold">priority_high</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200 mb-0.5">
            {t('input.error_title')}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}
    </div>
  );
}

export default ErrorNotification;
