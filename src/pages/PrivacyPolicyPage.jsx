import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

function PrivacyPolicyPage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('app.title')} | {t('privacy.title')}</title>
        <meta name="description" content={t('privacy.introduction.content')} />
        <html lang={i18n.language} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">{t('privacy.title')}</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.introduction.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.introduction.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.information_collection.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.information_collection.intro')}
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>
                <strong>{t('privacy.information_collection.usage_data.title')}</strong>{' '}
                {t('privacy.information_collection.usage_data.content')}
              </li>
              <li>
                <strong>{t('privacy.information_collection.analytics_data.title')}</strong>{' '}
                {t('privacy.information_collection.analytics_data.content')}
              </li>
              <li>
                <strong>{t('privacy.information_collection.technical_data.title')}</strong>{' '}
                {t('privacy.information_collection.technical_data.content')}
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.information_usage.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.information_usage.intro')}
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>{t('privacy.information_usage.provide_service')}</li>
              <li>{t('privacy.information_usage.improve_experience')}</li>
              <li>{t('privacy.information_usage.analyze_usage')}</li>
              <li>{t('privacy.information_usage.detect_issues')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.data_security.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.data_security.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.third_party.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t('privacy.third_party.intro')}</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>
                <strong>{t('privacy.third_party.google_analytics.title')}</strong>{' '}
                {t('privacy.third_party.google_analytics.content')}
              </li>
              <li>
                <strong>{t('privacy.third_party.recaptcha.title')}</strong>{' '}
                {t('privacy.third_party.recaptcha.content')}
              </li>
              <li>
                <strong>{t('privacy.third_party.firebase.title')}</strong>{' '}
                {t('privacy.third_party.firebase.content')}
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.cookies.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t('privacy.cookies.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.user_rights.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t('privacy.user_rights.intro')}</p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>{t('privacy.user_rights.access')}</li>
              <li>{t('privacy.user_rights.correction')}</li>
              <li>{t('privacy.user_rights.deletion')}</li>
              <li>{t('privacy.user_rights.opt_out')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.children.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t('privacy.children.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.policy_changes.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('privacy.policy_changes.content')}
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>{t('privacy.last_updated')}</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              {t('privacy.contact.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t('privacy.contact.content')}</p>
          </section>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicyPage;
