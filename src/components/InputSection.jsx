
import { ArrowRight, Loader2, Key } from 'lucide-react';
import { useState } from 'react';

const InputSection = ({ input, setInput, onSolve, error, isLoading, apiKey, setApiKey }) => {
  const [showKeyInput, setShowKeyInput] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8 relative overflow-hidden">
      
      {/* Top Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -mr-20 -mt-20 -z-0 pointer-events-none opacity-50"></div>

      {/* Error Notification */}
      {error && (
        <div className="relative z-10 mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start justify-between animate-trans-y-in">
          <div className="flex gap-3">
             <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-[16px] font-bold">priority_high</span>
             </div>
             <div>
                <h3 className="text-sm font-bold text-red-900 mb-0.5">Error Notification</h3>
                <p className="text-sm text-red-700">{error}</p>
             </div>
          </div>
          <button className="text-red-400 hover:text-red-500">
             <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      <div className="relative z-10 space-y-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          Input Sequence
        </label>
        
        <div className="relative group">
          <textarea 
            className={`w-full min-h-[160px] p-6 text-xl font-mono text-slate-800 bg-white rounded-xl border-2 shadow-sm
              ${error ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} 
              transition-all duration-200 resize-y outline-none placeholder:text-slate-300`}
            placeholder="2, 4, 8, 16"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck="false"
          ></textarea>
        </div>
        
        <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-400 font-medium">Use commas (e.g., 2, 4, 8)</span>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  {apiKey ? 'API Key Set' : 'Add Gemini API Key'}
                </button>
                <span className="text-xs text-slate-400 font-mono tracking-tight">{input.split(',').filter(x=>x.trim()).length} items</span>
            </div>
        </div>

        {/* Optional Key Input */}
        {showKeyInput && (
           <div className="mt-2 animate-in fade-in slide-in-from-top-1">
             <input 
               type="password"
               placeholder="Enter Gemini API Key (starts with AIza...)"
               className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
             />
             <p className="text-[10px] text-slate-400 mt-1 ml-1">Required for advanced pattern detection (interleaved, complex logic).</p>
           </div>
        )}
      </div>

        <div className="relative z-10 mt-8 flex justify-end">
            <button 
                className={`bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95 text-white font-bold text-sm px-10 py-3.5 rounded-lg shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 
                  ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                onClick={onSolve}
                disabled={!input.trim() || isLoading}
            >
                {isLoading ? (
                  <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Solve Pattern <ArrowRight className="w-5 h-5" /></>
                )}
            </button>
        </div>
    </div>
  );
};

export default InputSection;
