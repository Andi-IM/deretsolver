import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import logger from '@/utils/logger';
import { generateQuestion } from '@/utils/quizGenerator';

function QuizMode() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [difficulty, setDifficulty] = useState('MEDIUM'); // Default
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const loadNewQuestion = () => {
    try {
      const q = generateQuestion(difficulty);
      setQuestion(q);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } catch (err) {
      logger.error('Failed to generate quiz question', err);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return; // Prevent changing answer

    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const getOptionColor = (option) => {
    if (selectedOption === null)
      return 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';

    if (option === question.correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-700 font-bold';
    }
    if (option === selectedOption && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-700';
    }
    return 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
  };

  return (
    <>
      <Helmet>
        <title>Quiz Mode - {t('app.shortname')}</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-8 pt-8 px-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {difficulty}
            </span>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Streak: {streak} 🔥
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Pattern Quiz</h1>
          <p className="text-slate-500">Find the missing number in the sequence.</p>
        </div>

        {/* Question Card */}
        {question && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-center flex-wrap gap-3">
                {question.sequence.map((num, i) => (
                  <span
                    key={i}
                    className="text-2xl md:text-3xl font-mono font-semibold text-slate-800"
                  >
                    {num}
                    {i < question.sequence.length - 1 ? ',' : ''}
                  </span>
                ))}
                <span className="text-2xl md:text-3xl font-mono font-bold text-indigo-600 bg-indigo-50 px-3 rounded-lg border-2 border-dashed border-indigo-200">
                  ?
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 bg-slate-50/50 border-t border-slate-100">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 ${getOptionColor(option)} ${selectedOption === null ? 'hover:-translate-y-1 hover:shadow-md active:translate-y-0' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Explanation / Feedback */}
            {showExplanation && (
              <div
                className={`p-6 border-t ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full">
                    <h3
                      className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {isCorrect ? 'Correct! 🎉' : 'Incorrect 😔'}
                    </h3>
                    <p className="text-slate-700 mb-1">
                      <span className="font-semibold">Rule:</span> {question.rule}
                    </p>
                    <p className="text-slate-600 text-sm">{question.explanation}</p>
                  </div>
                  <button
                    onClick={loadNewQuestion}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 whitespace-nowrap w-full md:w-auto"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Difficulty Selector (Optional footer) */}
        {!selectedOption && (
          <div className="flex justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            {Object.keys(
              generateQuestion.name === 'generateQuestion' ? { EASY: 1, MEDIUM: 1, HARD: 1 } : {},
            ).map(
              (
                d, // Hack to just show buttons
              ) =>
                // Actually I should allow changing difficulty.
                // But for now hardcoded keys since I know them.
                ['EASY', 'MEDIUM', 'HARD'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(d);
                      setStreak(0);
                      loadNewQuestion();
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold ${difficulty === d ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {d}
                  </button>
                )),
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default QuizMode;
