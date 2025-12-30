import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ApiKeyInput from './input/ApiKeyInput';
import ErrorNotification from './input/ErrorNotification';
import InputHelperBar from './input/InputHelperBar';
import SequenceInput from './input/SequenceInput';
import SolveButton from './input/SolveButton';

function InputSection({ input, setInput, onSolve, error, isLoading, apiKey, setApiKey }) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const { t } = useTranslation();

  const itemCount = input.split(',').filter((x) => x.trim()).length;

  return (
    <div className="bg-bg-surface rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-border-base p-8 mb-8 relative overflow-hidden">
      {/* Top Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-bg-base rounded-bl-full -mr-20 -mt-20 -z-0 pointer-events-none opacity-50 dark:opacity-20" />

      <ErrorNotification error={error} />

      <div className="relative z-10 space-y-4">
        <SequenceInput value={input} onChange={setInput} hasError={!!error} />

        <InputHelperBar
          itemCount={itemCount}
          apiKeySet={!!apiKey}
          onApiKeyToggle={() => setShowKeyInput(!showKeyInput)}
        />

        <ApiKeyInput value={apiKey} onChange={setApiKey} visible={showKeyInput} />
      </div>

      <SolveButton
        onClick={onSolve}
        disabled={!input.trim()}
        isLoading={isLoading}
        label={t('input.solve')}
        loadingLabel={t('input.processing')}
      />
    </div>
  );
}

export default InputSection;
