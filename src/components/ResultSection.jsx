
const ResultSection = ({ result }) => {
  if (!result) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* LEFT COLUMN: Result Analysis */}
      <div className="lg:w-[350px] flex-shrink-0 flex flex-col">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col h-full">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Result Analysis</h3>
            
            {/* Success Badge */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Success</span>
                </div>
                <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                    Pattern successfully identified.
                </p>
            </div>

            <div className="space-y-6 flex-grow">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Pattern Type</h4>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{result.type}</p>
                </div>
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Rule</h4>
                    <p className="text-base text-slate-600 leading-relaxed">
                        {result.rule}
                    </p>
                </div>
            </div>

            <div className="pt-8 mt-4 border-t border-slate-50">
                <p className="text-center text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    {result.predictions && result.predictions.length > 1 ? 'Predicted Next Numbers' : 'Predicted Next Number'}
                </p>
                {result.predictions && result.predictions.length > 1 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {result.predictions.map((val, idx) => (
                             <div key={idx} className="bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-default text-white rounded-xl py-3 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 group">
                                <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Seq {idx + 1}</span>
                                <span className="text-2xl font-bold font-mono tracking-tight group-hover:scale-110 transition-transform">{val}</span>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-default text-white rounded-xl py-3 flex items-center justify-center shadow-lg shadow-emerald-500/20 group">
                        <span className="text-3xl font-bold font-mono tracking-tight group-hover:scale-110 transition-transform">{result.next}</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sequence Visualization */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sequence Visualization</h3>
                 
                 {/* Legend */}
                 <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Add</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Sub</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Mul</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Pow</div>
                 </div>
            </div>

            {/* Visualization Canvas */}
            <div className="relative flex-grow w-full min-h-[300px] bg-slate-50/30 rounded-xl border border-slate-100 overflow-hidden">
                {/* Dot Grid Background */}
                 <div className="absolute inset-0 opacity-40 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                 </div>
                 
                 <div className="absolute inset-0 p-4">
                     {/* Horizontal Scroll Container */}
                     <div className="w-full h-full overflow-x-auto flex items-center px-4">
                         <div className="flex items-center mx-auto min-w-max">
                            <VisualizerContent visualization={result.visualization} />
                         </div>
                     </div>
                 </div>
            </div>
        </div>
      </div>

    </div>
  );
};

const VisualizerContent = ({ visualization }) => {
    if (!visualization) return null;
    const { nodes, links } = visualization;

    return (
        <div className="flex items-center">
            {nodes.map((node, i) => (
                <div key={i} className="flex items-center">
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0">
                         <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold font-mono shadow-sm bg-white transition-all duration-300
                            ${node.isPrediction 
                                ? 'border-emerald-400 text-emerald-600 ring-4 ring-emerald-50 scale-110' 
                                : 'border-slate-300 text-slate-700'
                            }`}
                        >
                            {node.value}
                        </div>
                         <div className={`absolute -bottom-6 w-full text-center text-[10px] font-mono font-medium
                            ${node.isPrediction ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {node.label || (node.isPrediction ? 'NEXT' : `i=${i}`)}
                         </div>
                    </div>

                    {/* Link */}
                    {i < nodes.length - 1 && (
                        <div className="relative flex items-center justify-center w-16 sm:w-20 md:w-24 flex-shrink-0 -mx-1">
                            {/* Line */}
                            <div className={`absolute w-full h-[2px] ${node.isPrediction ? 'bg-emerald-200 dashed' : 'bg-slate-300'}`}></div>
                            
                            {/* Label capsule */}
                            {links[i] && (
                                <div className={`relative z-10 px-2.5 py-1 text-[10px] font-bold text-white rounded-full shadow-sm transform -translate-y-[1px]
                                    ${links[i].type === 'add' ? 'bg-blue-500' : ''}
                                    ${links[i].type === 'sub' ? 'bg-red-500' : ''}
                                    ${links[i].type === 'mul' ? 'bg-orange-500' : ''}
                                    ${links[i].type === 'pow' ? 'bg-purple-500' : ''}
                                `}>
                                    {links[i].label}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ResultSection;
