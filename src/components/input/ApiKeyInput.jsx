import { useTranslation } from 'react-i18next';

function ApiKeyInput({ value, onChange, visible }) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
      <input
        type="password"
        placeholder={t('input.api_key_placeholder')}
        className="w-full p-3 text-sm border border-border-base bg-bg-surface text-text-base rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-[10px] text-text-muted mt-1 ml-1">{t('input.api_key_helper')}</p>
    </div>
  );
}

export default ApiKeyInput;
