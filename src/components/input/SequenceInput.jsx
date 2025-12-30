import { useTranslation } from 'react-i18next';

function SequenceInput({ value, onChange, hasError }) {
  const { t } = useTranslation();

  return (
    <>
      <label
        htmlFor="input-sequence"
        className="block text-xs font-bold text-text-muted uppercase tracking-widest ml-1"
      >
        {t('input.label')}
      </label>

      <div className="relative group">
        <textarea
          id="input-sequence"
          className={`w-full min-h-[160px] p-6 text-xl font-mono text-text-base bg-bg-surface rounded-xl border-2 shadow-sm
            ${
              hasError
                ? 'border-red-300 dark:border-red-900 focus:border-red-400 dark:focus:border-red-800 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20'
                : 'border-border-base focus:border-primary focus:ring-4 focus:ring-primary/10'
            } 
            transition-all duration-200 resize-y outline-none placeholder:text-text-muted/50`}
          placeholder={t('input.placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck="false"
        />
      </div>
    </>
  );
}

export default SequenceInput;
