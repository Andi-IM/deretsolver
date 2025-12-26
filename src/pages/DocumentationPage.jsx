import React, { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { analytics } from '../utils/firebase';

const PATTERNS_LIST = [
  { key: 'arithmetic', example: '2, 5, 8, 11' },
  { key: 'geometric', example: '3, 6, 12, 24' },
  { key: 'fibonacci', example: '1, 1, 2, 3, 5' },
  { key: 'triangular', example: '1, 3, 6, 10, 15' },
  { key: 'interleaved', example: '1, 10, 2, 20, 3' },
  { key: 'perfect_powers', example: '1, 4, 9, 16' },
  { key: 'two_level', example: '1, 3, 6, 10' },
];

function DocumentationPage() {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, 'page_view', { page_path: location.pathname, page_title: 'Documentation' });
  }, [location]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-blue-500">menu_book</span>
        {t('documentation.title')}
      </h2>

      <div className="grid gap-12">
        {/* How to Use */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
              1
            </span>
            {t('documentation.how_to_use.title')}
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              <Trans
                i18nKey="documentation.how_to_use.content"
                components={{
                  1: (
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-sm" />
                  ),
                }}
              />
            </p>
          </div>
        </section>

        {/* API Key Guide */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
              2
            </span>
            {t('documentation.api_key.title')}
          </h3>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-amber-600 text-3xl shrink-0">
                vpn_key
              </span>
              <div className="space-y-3">
                <h4 className="font-bold text-amber-900 text-base">
                  {t('documentation.api_key.required_title')}
                </h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  <Trans
                    i18nKey="documentation.api_key.required_desc"
                    components={{ 1: <strong /> }}
                  />
                </p>
                <div className="pt-2">
                  <a
                    href="https://ai.google.dev/gemini-api/docs/api-key#import-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 font-bold text-sm rounded-lg border border-amber-200 shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    {t('documentation.api_key.get_key')}
                  </a>
                </div>
                <p className="text-xs text-amber-800 mt-2">{t('documentation.api_key.note')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Patterns */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              3
            </span>
            {t('documentation.supported_patterns.title')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {PATTERNS_LIST.map((pattern) => (
              <div
                key={pattern.key}
                className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <div className="font-bold text-slate-700 mb-1">
                    {t(`documentation.supported_patterns.${pattern.key}.name`)}
                  </div>
                  <div className="text-slate-700 text-xs mb-2">
                    {t(`documentation.supported_patterns.${pattern.key}.desc`)}
                  </div>
                  <code className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-800 block w-fit">
                    {pattern.example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DocumentationPage;
