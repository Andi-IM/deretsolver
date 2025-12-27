import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import FeedbackDialog from '@/components/FeedbackDialog';
import InputSection from '@/components/InputSection';
import ResultSection from '@/components/ResultSection';
import { useSolver } from '@/hooks/useSolver';
import logger from '@/utils/logger';

function SolverPage() {
  const { input, setInput, handleSolve, result, error, isLoading, apiKey, setApiKey } = useSolver();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Analytics: Log page view (deferred to not block render)
  useEffect(() => {
    import('@/utils/firebase')
      .then(({ initializeFirebase }) => initializeFirebase())
      .then(({ analytics }) => {
        if (analytics) {
          import('firebase/analytics').then(({ logEvent }) => {
            logEvent(analytics, 'page_view', {
              page_path: location.pathname,
              page_title: 'Solver',
            });
          });
        }
      })
      .catch((err) => logger.error('Failed to log analytics:', err));
  }, [location.pathname]);

  // Update document title manually to ensure it works with client-side navigation
  useEffect(() => {
    document.title = `${t('app.shortname')}`;
  }, [t, location.pathname]);

  return (
    <>
      <Helmet>
        <meta name="description" content={t('app.description')} />
        <html lang={i18n.language} />
      </Helmet>

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 pt-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          {t('app.title')}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed font-normal">{t('app.description')}</p>
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
