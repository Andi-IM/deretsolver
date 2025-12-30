import { ArrowRight, Loader2 } from 'lucide-react';

function SolveButton({ onClick, disabled, isLoading, label, loadingLabel }) {
  return (
    <div className="relative z-10 mt-8 flex justify-end">
      <button
        type="button"
        className={`bg-primary hover:opacity-90 active:scale-95 text-white font-bold text-sm px-10 py-3.5 rounded-lg shadow-xl shadow-primary/20 dark:shadow-none transition-all flex items-center gap-2 
          ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            {loadingLabel} <Loader2 className="w-5 h-5 animate-spin" />
          </>
        ) : (
          <>
            {label} <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}

export default SolveButton;
