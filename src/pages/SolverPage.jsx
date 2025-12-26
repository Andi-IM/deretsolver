import React, { useEffect } from 'react';
import InputSection from '../components/InputSection';
import ResultSection from '../components/ResultSection';
import FeedbackDialog from '../components/FeedbackDialog';
import { useSolver } from '../hooks/useSolver';
import { logEvent } from "firebase/analytics";
import { analytics } from "../utils/firebase";
import { useLocation } from 'react-router-dom';

const SolverPage = () => {
    const { input, setInput, handleSolve, result, error, isLoading, apiKey, setApiKey } = useSolver();
    const location = useLocation();

    useEffect(() => {
        logEvent(analytics, 'page_view', {page_path: location.pathname, page_title: 'Solver' });
    }, [location]);

    return (
        <>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Number Sequence Pattern Solver</h2>
                <p className="text-lg text-slate-500 leading-relaxed font-normal">
                    Enter a sequence to find the hidden pattern and predict the next number <br className="hidden md:block"/> instantly.
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

            <ResultSection 
                result={result} 
            />
            
            <FeedbackDialog key={result ? result.id : 'no-result'} result={result} input={input} />
        </>
    );
};

export default SolverPage;
