import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import logger from '@/utils/logger';

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
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Analytics: Log page view (deferred to not block render)
  useEffect(() => {
    import('@/utils/firebase')
      .then(({ initializeFirebase }) => initializeFirebase())
      .then(({ analytics }) => {
        if (analytics) {
          return import('firebase/analytics').then(({ logEvent }) => {
            logEvent(analytics, 'page_view', {
              page_path: location.pathname,
              page_title: 'Documentation',
            });
          });
        }
        return null;
      })
      .catch((err) => logger.error('Failed to log analytics:', err));
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{`${t('documentation.title')} | ${t('app.shortname')}`}</title>
        <meta name="description" content={t('app.description')} />
        <link rel="canonical" href="https://deretsolver.airham.my.id/docs" />
        <meta property="og:title" content={`${t('documentation.title')} | ${t('app.shortname')}`} />
        <meta property="og:description" content={t('app.description')} />
        <meta property="og:url" content="https://deretsolver.airham.my.id/docs" />
        <meta property="og:type" content="article" />
        <html lang={i18n.language} />
      </Helmet>
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-blue-500">menu_book</span>
          {t('documentation.title')}
        </h2>

        <div className="grid gap-12">
          {/* Introduction */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                1
              </span>
              {t('documentation.introduction.title')}
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-purple-600 text-3xl shrink-0">
                  psychology
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {t('documentation.introduction.content')}
                </p>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                2
              </span>
              {t('documentation.how_to_use.title')}
            </h3>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>{t('documentation.how_to_use.intro')}</p>
            </div>

            {/* Valid Examples */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h4 className="font-bold text-green-900 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {t('documentation.how_to_use.valid_examples.title')}
              </h4>
              <div className="grid gap-2 text-sm">
                <p className="text-green-800">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.integers"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-green-900 font-mono" />,
                    }}
                  />
                </p>
                <p className="text-green-800">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.negatives"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-green-900 font-mono" />,
                    }}
                  />
                </p>
                <p className="text-green-800">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.decimals"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-green-900 font-mono" />,
                    }}
                  />
                </p>
                <p className="text-green-800">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.mixed"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-green-900 font-mono" />,
                    }}
                  />
                </p>
              </div>
            </div>

            {/* Invalid Examples */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
              <h4 className="font-bold text-rose-900 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {t('documentation.how_to_use.invalid_examples.title')}
              </h4>
              <div className="grid gap-2 text-sm">
                <p className="text-rose-800">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.too_few"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-rose-900 font-mono" />,
                    }}
                  />
                </p>
                <p className="text-rose-800">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.non_numeric"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-rose-900 font-mono" />,
                    }}
                  />
                </p>
                <p className="text-rose-800">
                  {t('documentation.how_to_use.invalid_examples.empty')}
                </p>
                <p className="text-rose-800">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.special_chars"
                    components={{
                      1: <code className="bg-white px-2 py-0.5 rounded text-rose-900 font-mono" />,
                    }}
                  />
                </p>
              </div>
            </div>

            {/* Input Guidelines */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                {t('documentation.how_to_use.guidelines.title')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>{t('documentation.how_to_use.guidelines.tip1')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip2')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip3')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip4')}</li>
              </ul>
            </div>
          </section>

          {/* Pattern Recognition Guide */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                3
              </span>
              {t('documentation.recognition_guide.title')}
            </h3>
            <p className="text-slate-600 text-sm">{t('documentation.recognition_guide.intro')}</p>

            <div className="grid gap-4">
              {/* Step 1: Differences */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-indigo-900">
                      {t('documentation.recognition_guide.step1.title')}
                    </h4>
                    <p className="text-slate-700 text-sm">
                      <Trans
                        i18nKey="documentation.recognition_guide.step1.desc"
                        components={{ 1: <strong className="text-indigo-700" /> }}
                      />
                    </p>
                    <div className="bg-indigo-50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-indigo-900">
                        {t('documentation.recognition_guide.step1.example')}
                      </p>
                      <p className="text-xs text-indigo-700">
                        {t('documentation.recognition_guide.step1.calculation')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Ratios */}
              <div className="bg-white border-2 border-teal-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-teal-900">
                      {t('documentation.recognition_guide.step2.title')}
                    </h4>
                    <p className="text-slate-700 text-sm">
                      <Trans
                        i18nKey="documentation.recognition_guide.step2.desc"
                        components={{ 1: <strong className="text-teal-700" /> }}
                      />
                    </p>
                    <div className="bg-teal-50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-teal-900">
                        {t('documentation.recognition_guide.step2.example')}
                      </p>
                      <p className="text-xs text-teal-700">
                        {t('documentation.recognition_guide.step2.calculation')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Alternating */}
              <div className="bg-white border-2 border-violet-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-violet-900">
                      {t('documentation.recognition_guide.step3.title')}
                    </h4>
                    <p className="text-slate-700 text-sm">
                      {t('documentation.recognition_guide.step3.desc')}
                    </p>
                    <div className="bg-violet-50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-violet-900">
                        {t('documentation.recognition_guide.step3.example')}
                      </p>
                      <p className="text-xs text-violet-700">
                        {t('documentation.recognition_guide.step3.calculation')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Supported Patterns */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                4
              </span>
              {t('documentation.supported_patterns.title')}
            </h3>
            <div className="grid gap-4">
              {PATTERNS_LIST.map((pattern) => (
                <div
                  key={pattern.key}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    {/* Pattern Name & Description */}
                    <div>
                      <div className="font-bold text-slate-800 text-base mb-1">
                        {t(`documentation.supported_patterns.${pattern.key}.name`)}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {t(`documentation.supported_patterns.${pattern.key}.desc`)}
                      </div>
                    </div>

                    {/* Thought Process */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                      <p className="text-xs font-semibold text-amber-900 mb-1">
                        💭 Thought Process:
                      </p>
                      <p className="text-xs text-amber-800">
                        {t(`documentation.supported_patterns.${pattern.key}.thought_process`)}
                      </p>
                    </div>

                    {/* Example & Steps */}
                    <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">
                          {t(`documentation.supported_patterns.${pattern.key}.example_sequence`)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">📊 Step-by-step:</p>
                        <p className="text-xs font-mono text-slate-800">
                          {t(`documentation.supported_patterns.${pattern.key}.step_by_step`)}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">🎯 Prediction:</p>
                        <p className="text-xs font-semibold text-emerald-700">
                          {t(`documentation.supported_patterns.${pattern.key}.next_prediction`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* API Key & Complex Patterns */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
                5
              </span>
              {t('documentation.api_key.title')}
            </h3>

            <p className="text-slate-600 text-sm">{t('documentation.api_key.intro')}</p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Basic Features (Offline) */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-green-600 text-2xl">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-bold text-green-900 text-sm mb-1">
                      {t('documentation.api_key.basic_features.title')}
                    </h4>
                    <p className="text-xs text-green-700">
                      {t('documentation.api_key.basic_features.patterns')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-green-800">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example1"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-green-800">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example2"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-green-800">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example3"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-green-800">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example4"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                </div>
              </div>

              {/* Advanced Features (Requires API Key) */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">vpn_key</span>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-1">
                      {t('documentation.api_key.advanced_features.title')}
                    </h4>
                    <p className="text-xs text-amber-700">
                      {t('documentation.api_key.advanced_features.patterns')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs mb-4">
                  <p className="text-amber-800">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example1"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-amber-800">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example2"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-amber-800">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example3"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                  <p className="text-amber-800">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example4"
                      components={{
                        1: <code className="bg-white px-1.5 py-0.5 rounded font-mono" />,
                      }}
                    />
                  </p>
                </div>
                <div className="pt-3 border-t border-amber-200">
                  <a
                    href="https://ai.google.dev/gemini-api/docs/api-key#import-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-amber-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    {t('documentation.api_key.get_key')}
                  </a>
                  <p className="text-xs text-amber-700 mt-2">{t('documentation.api_key.note')}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default DocumentationPage;
