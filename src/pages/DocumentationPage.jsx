import { Helmet } from 'react-helmet-async';
import { Trans, useTranslation } from 'react-i18next';

import { usePageTracking } from '@/hooks/usePageTracking';

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
  // Analytics: Log page view
  usePageTracking('Documentation');

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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-blue-500">menu_book</span>
          {t('documentation.title')}
        </h2>

        <div className="grid gap-12">
          {/* Introduction */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                1
              </span>
              {t('documentation.introduction.title')}
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-100 dark:border-purple-900/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl shrink-0">
                  psychology
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t('documentation.introduction.content')}
                </p>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                2
              </span>
              {t('documentation.how_to_use.title')}
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
              <p>{t('documentation.how_to_use.intro')}</p>
            </div>

            {/* Valid Examples */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-xl p-5">
              <h4 className="font-bold text-green-900 dark:text-green-300 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {t('documentation.how_to_use.valid_examples.title')}
              </h4>
              <div className="grid gap-2 text-sm">
                <p className="text-green-800 dark:text-green-400">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.integers"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-green-900 dark:text-green-300 font-mono" />
                      ),
                    }}
                  />
                </p>
                <p className="text-green-800 dark:text-green-400">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.negatives"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-green-900 dark:text-green-300 font-mono" />
                      ),
                    }}
                  />
                </p>
                <p className="text-green-800 dark:text-green-400">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.decimals"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-green-900 dark:text-green-300 font-mono" />
                      ),
                    }}
                  />
                </p>
                <p className="text-green-800 dark:text-green-400">
                  <Trans
                    i18nKey="documentation.how_to_use.valid_examples.mixed"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-green-900 dark:text-green-300 font-mono" />
                      ),
                    }}
                  />
                </p>
              </div>
            </div>

            {/* Invalid Examples */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl p-5">
              <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {t('documentation.how_to_use.invalid_examples.title')}
              </h4>
              <div className="grid gap-2 text-sm">
                <p className="text-rose-800 dark:text-rose-400">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.too_few"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-rose-900 dark:text-rose-300 font-mono" />
                      ),
                    }}
                  />
                </p>
                <p className="text-rose-800 dark:text-rose-400">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.non_numeric"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-rose-900 dark:text-rose-300 font-mono" />
                      ),
                    }}
                  />
                </p>
                <p className="text-rose-800 dark:text-rose-400">
                  {t('documentation.how_to_use.invalid_examples.empty')}
                </p>
                <p className="text-rose-800 dark:text-rose-400">
                  <Trans
                    i18nKey="documentation.how_to_use.invalid_examples.special_chars"
                    components={{
                      1: (
                        <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-rose-900 dark:text-rose-300 font-mono" />
                      ),
                    }}
                  />
                </p>
              </div>
            </div>

            {/* Input Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                {t('documentation.how_to_use.guidelines.title')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>{t('documentation.how_to_use.guidelines.tip1')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip2')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip3')}</li>
                <li>{t('documentation.how_to_use.guidelines.tip4')}</li>
              </ul>
            </div>
          </section>

          {/* Pattern Recognition Guide */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
                3
              </span>
              {t('documentation.recognition_guide.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('documentation.recognition_guide.intro')}
            </p>

            <div className="grid gap-4">
              {/* Step 1: Differences */}
              <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300">
                      {t('documentation.recognition_guide.step1.title')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      <Trans
                        i18nKey="documentation.recognition_guide.step1.desc"
                        components={{
                          1: <strong className="text-indigo-700 dark:text-indigo-400" />,
                        }}
                      />
                    </p>
                    <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-indigo-900 dark:text-indigo-300">
                        {t('documentation.recognition_guide.step1.example')}
                      </p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400">
                        {t('documentation.recognition_guide.step1.calculation')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Ratios */}
              <div className="bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-900/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-teal-900 dark:text-teal-300">
                      {t('documentation.recognition_guide.step2.title')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      <Trans
                        i18nKey="documentation.recognition_guide.step2.desc"
                        components={{ 1: <strong className="text-teal-700 dark:text-teal-400" /> }}
                      />
                    </p>
                    <div className="bg-teal-50 dark:bg-teal-950/50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-teal-900 dark:text-teal-300">
                        {t('documentation.recognition_guide.step2.example')}
                      </p>
                      <p className="text-xs text-teal-700 dark:text-teal-400">
                        {t('documentation.recognition_guide.step2.calculation')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Alternating */}
              <div className="bg-white dark:bg-slate-900 border-2 border-violet-200 dark:border-violet-900/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-violet-900 dark:text-violet-300">
                      {t('documentation.recognition_guide.step3.title')}
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      {t('documentation.recognition_guide.step3.desc')}
                    </p>
                    <div className="bg-violet-50 dark:bg-violet-950/50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-mono text-violet-900 dark:text-violet-300">
                        {t('documentation.recognition_guide.step3.example')}
                      </p>
                      <p className="text-xs text-violet-700 dark:text-violet-400">
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
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                4
              </span>
              {t('documentation.supported_patterns.title')}
            </h3>
            <div className="grid gap-4">
              {PATTERNS_LIST.map((pattern) => (
                <div
                  key={pattern.key}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md dark:shadow-none transition-all"
                >
                  <div className="space-y-3">
                    {/* Pattern Name & Description */}
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-base mb-1">
                        {t(`documentation.supported_patterns.${pattern.key}.name`)}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        {t(`documentation.supported_patterns.${pattern.key}.desc`)}
                      </div>
                    </div>

                    {/* Thought Process */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 p-3 rounded">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                        💭 Thought Process:
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        {t(`documentation.supported_patterns.${pattern.key}.thought_process`)}
                      </p>
                    </div>

                    {/* Example & Steps */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {t(`documentation.supported_patterns.${pattern.key}.example_sequence`)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          📊 Step-by-step:
                        </p>
                        <p className="text-xs font-mono text-slate-800 dark:text-slate-200">
                          {t(`documentation.supported_patterns.${pattern.key}.step_by_step`)}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          🎯 Prediction:
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                5
              </span>
              {t('documentation.api_key.title')}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('documentation.api_key.intro')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Basic Features (Offline) */}
              <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-bold text-green-900 dark:text-green-300 text-sm mb-1">
                      {t('documentation.api_key.basic_features.title')}
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {t('documentation.api_key.basic_features.patterns')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-green-800 dark:text-green-400">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example1"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-green-800 dark:text-green-400">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example2"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-green-800 dark:text-green-400">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example3"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-green-800 dark:text-green-400">
                    <Trans
                      i18nKey="documentation.api_key.basic_features.example4"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                </div>
              </div>

              {/* Advanced Features (Requires API Key) */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">
                    vpn_key
                  </span>
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
                      {t('documentation.api_key.advanced_features.title')}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {t('documentation.api_key.advanced_features.patterns')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs mb-4">
                  <p className="text-amber-800 dark:text-amber-400">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example1"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-amber-800 dark:text-amber-400">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example2"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-amber-800 dark:text-amber-400">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example3"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                  <p className="text-amber-800 dark:text-amber-400">
                    <Trans
                      i18nKey="documentation.api_key.advanced_features.example4"
                      components={{
                        1: (
                          <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono" />
                        ),
                      }}
                    />
                  </p>
                </div>
                <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                  <a
                    href="https://ai.google.dev/gemini-api/docs/api-key#import-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-amber-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    {t('documentation.api_key.get_key')}
                  </a>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    {t('documentation.api_key.note')}
                  </p>
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
