import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import FeedbackDialog from '@/components/FeedbackDialog';
import InputSection from '@/components/InputSection';
import ResultSection from '@/components/ResultSection';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useSolver } from '@/hooks/useSolver';

function SolverPage() {
  const { input, setInput, handleSolve, result, error, isLoading, apiKey, setApiKey } = useSolver();
  const { t, i18n } = useTranslation();

  // Analytics: Log page view
  usePageTracking('Solver');

  return (
    <>
      <Helmet>
        <title>{t('app.shortname')}</title>
        <meta name="description" content={t('app.description')} />
        <link rel="canonical" href="https://deretsolver.airham.my.id/" />
        <meta property="og:title" content={t('app.shortname')} />
        <meta property="og:description" content={t('app.description')} />
        <meta property="og:url" content="https://deretsolver.airham.my.id/" />
        <meta property="og:type" content="website" />
        <html lang={i18n.language} />
      </Helmet>

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 pt-8 text-balance">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('app.title')}
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          {t('app.description')}
        </p>
      </div>

      <InputSection
        input={input}
        setInput={setInput}
        onSolve={handleSolve}
        error={error}
        isLoading={isLoading}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <ResultSection result={result} />

      <FeedbackDialog key={result ? result.id : 'no-result'} result={result} input={input} />
    </>
  );
}

export default SolverPage;
