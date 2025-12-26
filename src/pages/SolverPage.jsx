import React, { useEffect } from "react";
import InputSection from "../components/InputSection";
import ResultSection from "../components/ResultSection";
import FeedbackDialog from "../components/FeedbackDialog";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useSolver } from "../hooks/useSolver";
import { logEvent } from "firebase/analytics";
import { analytics } from "../utils/firebase";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const SolverPage = () => {
  const {
    input,
    setInput,
    handleSolve,
    result,
    error,
    isLoading,
    apiKey,
    setApiKey,
  } = useSolver();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    logEvent(analytics, "page_view", {
      page_path: location.pathname,
      page_title: "Solver",
    });
  }, [location]);

  return (
    <>
      <Helmet>
        <title>
          {t("app.title")} | {t("page.solver")}
        </title>
        <meta name="description" content={t("app.description")} />
        <html lang={i18n.language} />
      </Helmet>

      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 pt-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          {t("app.title")}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed font-normal">
          {t("app.description")}
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

      <FeedbackDialog
        key={result ? result.id : "no-result"}
        result={result}
        input={input}
      />
    </>
  );
};

export default SolverPage;
