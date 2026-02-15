import { useTranslation } from 'react-i18next';

function ApiKeyInput({ value, onChange, visible, provider, onProviderChange }) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="mt-2 animate-in fade-in slide-in-from-top-1 space-y-2">
      <div className="flex items-center gap-2">
        <select
          className="p-3 text-sm border border-border-base bg-bg-surface text-text-base rounded-lg focus:border-primary outline-none cursor-pointer"
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
        >
          <option value="gemini">Gemini AI</option>
          <option value="sumopod">SumoPod AI</option>
        </select>
        <div className="relative flex-grow">
          <input
            type="password"
            placeholder={
              provider === 'sumopod'
                ? t('input.sumopod_key_placeholder', 'SumoPod API Key')
                : t('input.api_key_placeholder')
            }
            className="w-full p-3 text-sm border border-border-base bg-bg-surface text-text-base rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      <p className="text-[10px] text-text-muted ml-1">
        {provider === 'sumopod'
          ? t('input.sumopod_key_helper', 'SumoPod is currently in free session. Use sk-xxx...')
          : t('input.api_key_helper')}
      </p>
    </div>
  );
}

export default ApiKeyInput;
