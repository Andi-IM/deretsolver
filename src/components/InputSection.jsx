import { ArrowRight, Loader2, Key } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function InputSection({ input, setInput, onSolve, error, isLoading, apiKey, setApiKey }) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8 relative overflow-hidden">
      {/* Top Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -mr-20 -mt-20 -z-0 pointer-events-none opacity-50" />

      {/* Error Notification */}
      {error && (
        <div className="relative z-10 mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start justify-between animate-trans-y-in">
          <div className="flex gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] font-bold">priority_high</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 mb-0.5">{t('input.error_title')}</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button type="button" className="text-red-400 hover:text-red-500">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      <div className="relative z-10 space-y-4">
        <label
          htmlFor="input-sequence"
          className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1"
        >
          {t('input.label')}
        </label>

        <div className="relative group">
          <textarea
            id="input-sequence"
            className={`w-full min-h-[160px] p-6 text-xl font-mono text-slate-800 bg-white rounded-xl border-2 shadow-sm
              ${
                error
                  ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
              } 
              transition-all duration-200 resize-y outline-none placeholder:text-slate-300`}
            placeholder={t('input.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-3 sm:gap-0">
          <span className="text-xs text-slate-400 font-medium">{t('input.helper')}</span>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
            >
              <Key className="w-3 h-3" />
              {apiKey ? t('input.api_key_set') : t('input.add_api_key')}
            </button>
            <span className="text-xs text-slate-400 font-mono tracking-tight shrink-0">
              {t('input.items_count', {
                count: input.split(',').filter((x) => x.trim()).length,
              })}
            </span>
          </div>
        </div>

        {/* Optional Key Input */}
        {showKeyInput && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-1">
            <input
              type="password"
              placeholder={t('input.api_key_placeholder')}
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-1 ml-1">{t('input.api_key_helper')}</p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-8 flex justify-end">
        <button
          type="button"
          className={`bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95 text-white font-bold text-sm px-10 py-3.5 rounded-lg shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 
                  ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
          onClick={onSolve}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <>
              {t('input.processing')} <Loader2 className="w-5 h-5 animate-spin" />
            </>
          ) : (
            <>
              {t('input.solve')} <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default InputSection;
