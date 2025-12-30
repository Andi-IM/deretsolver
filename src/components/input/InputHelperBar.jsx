import { useTranslation } from 'react-i18next';

import { Key } from 'lucide-react';

function InputHelperBar({ itemCount, apiKeySet, onApiKeyToggle }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-3 sm:gap-0">
      <span className="text-xs text-text-muted font-medium">{t('input.helper')}</span>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <button
          type="button"
          onClick={onApiKeyToggle}
          className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Key className="w-3 h-3" />
          {apiKeySet ? t('input.api_key_set') : t('input.add_api_key')}
        </button>
        <span className="text-xs text-text-muted font-mono tracking-tight shrink-0">
          {t('input.items_count', { count: itemCount })}
        </span>
      </div>
    </div>
  );
}

export default InputHelperBar;
