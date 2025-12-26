import React, { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";

const FeedbackDialog = ({ result, input }) => {
  const [status, setStatus] = useState("idle"); // idle, helpful, not_helpful_form, submitting, submitted
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const { t } = useTranslation();

  const handleHelpful = async () => {
    setStatus("submitting");
    try {
      await addDoc(collection(db, "feedback"), {
        isHelpful: true,
        question: input,
        answer: result.predictions
          ? result.predictions.join(", ")
          : result.next,
        resultType: result.type,
        resultRule: result.rule,
        timestamp: serverTimestamp(),
        // We can add more context if needed
      });
      setStatus("submitted");
    } catch (error) {
      console.error("Error adding document: ", error);
      // Even if it fails, we probably just want to show the thank you message or revert
      setStatus("submitted"); // Optimistic UI
    }
  };

  const handleNotHelpful = () => {
    setStatus("not_helpful_form");
  };

  const handleSubmitNotHelpful = async () => {
    if (!reason) return; // Require a reason
    setStatus("submitting");
    try {
      await addDoc(collection(db, "feedback"), {
        isHelpful: false,
        reason: reason,
        comment: comment,
        question: input,
        answer: result?.predictions
          ? result.predictions.join(", ")
          : result?.next,
        resultType: result?.type || "unknown",
        resultRule: result?.rule || "unknown",
        timestamp: serverTimestamp(),
      });
      setStatus("submitted");
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus("submitted");
    }
  };

  if (!result) return null;

  const reasons = [
    { label: t("feedback.reasons.incorrect"), value: "Incorrect Result" },
    { label: t("feedback.reasons.unclear"), value: "Unclear Explanation" },
    { label: t("feedback.reasons.other"), value: "Other" },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6">
        {status === "submitted" ? (
          <div className="text-center py-4 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">
                thumb_up
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {t("feedback.thank_you")}
            </h3>
            <p className="text-slate-500">{t("feedback.thank_you_message")}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {t("feedback.title")}
              </h3>
            </div>

            {status === "idle" && (
              <div className="text-center py-2">
                <p className="text-slate-700 font-medium mb-6 text-lg">
                  {t("feedback.question")}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleHelpful}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      thumb_up
                    </span>
                    {t("feedback.yes")}
                  </button>
                  <button
                    onClick={handleNotHelpful}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      thumb_down
                    </span>
                    {t("feedback.no")}
                  </button>
                </div>
              </div>
            )}

            {status === "not_helpful_form" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-slate-700 font-medium mb-4">
                  {t("feedback.issue_prompt")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                        reason === r.value
                          ? "bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t("feedback.details_label")}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("feedback.details_placeholder")}
                    className="w-full h-24 rounded-xl border border-slate-200 p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm placeholder:text-slate-400"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                  >
                    {t("feedback.cancel")}
                  </button>
                  <button
                    onClick={handleSubmitNotHelpful}
                    disabled={!reason}
                    className={`px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${
                      reason
                        ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {t("feedback.submit")}
                  </button>
                </div>
              </div>
            )}

            {status === "submitting" && (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                <p className="text-slate-400 text-sm font-medium">
                  {t("feedback.sending")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackDialog;
