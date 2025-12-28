import { useTranslation } from 'react-i18next';

import { sanitize } from '@/utils/security';

function ResultSection({ result }) {
  const { t } = useTranslation();
  if (!result) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* LEFT COLUMN: Result Analysis */}
      <div className="lg:w-[350px] flex-shrink-0 flex flex-col">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col h-full">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-6">
            {t('result.analysis_title')}
          </h3>

          {/* Success Badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[10px] font-bold">
                  check
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                {t('result.success')}
              </span>
            </div>
            <p className="text-sm text-emerald-900 font-medium leading-relaxed">
              {t('result.success_message')}
            </p>
          </div>

          <div className="space-y-6 flex-grow">
            <div>
              <h4 className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                {t('result.pattern_type')}
              </h4>
              <p className="text-lg font-bold text-slate-900 leading-tight">
                {sanitize(result.type)}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                {t('result.rule')}
              </h4>
              <p className="text-base text-slate-600 leading-relaxed">{sanitize(result.rule)}</p>
            </div>
          </div>

          <div className="pt-8 mt-4 border-t border-slate-50">
            <p className="text-center text-xs font-medium text-slate-600 mb-3 uppercase tracking-wide">
              {result.predictions && result.predictions.length > 1
                ? t('result.predicted_next_plural')
                : t('result.predicted_next')}
            </p>
            {result.predictions && result.predictions.length > 1 ? (
              <div className="grid grid-cols-2 gap-3">
                {result.predictions.map((val, idx) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-default text-white rounded-xl py-3 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 group"
                  >
                    <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">
                      Seq {idx + 1}
                    </span>
                    <span className="text-2xl font-bold font-mono tracking-tight group-hover:scale-110 transition-transform">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-default text-white rounded-xl py-3 flex items-center justify-center shadow-lg shadow-emerald-500/20 group">
                <span className="text-3xl font-bold font-mono tracking-tight group-hover:scale-110 transition-transform">
                  {result.next}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sequence Visualization */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
              {t('result.visualization_title')}
            </h3>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> {t('result.legend.add')}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> {t('result.legend.sub')}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> {t('result.legend.mul')}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> {t('result.legend.pow')}
              </div>
            </div>
          </div>

          {/* Visualization Canvas */}
          <div className="relative flex-grow w-full min-h-[300px] bg-slate-50/30 rounded-xl border border-slate-100 overflow-hidden">
            {/* Dot Grid Background */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

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
}

function VisualizerContent({ visualization }) {
  if (!visualization) return null;
  const { nodes, connections = [] } = visualization;

  // Layout Constants
  const NODE_SIZE = 56; // w-14 (56px)
  const GAP = 64; // Space between nodes
  const ITEM_WIDTH = NODE_SIZE + GAP;

  // Calculate total dimensions
  const totalWidth = Math.max(
    nodes.length * ITEM_WIDTH - GAP + NODE_SIZE / 2,
    nodes.length * ITEM_WIDTH + 20,
  );

  const CONTAINER_HEIGHT = 200;
  const MIDDLE_Y = CONTAINER_HEIGHT / 2;

  return (
    <div className="relative" style={{ width: totalWidth, height: CONTAINER_HEIGHT }}>
      {/* SVG Layer for Connections */}
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        width="100%"
        height="100%"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>

        {connections.map((conn) => {
          // Coordinates
          const x1 = conn.fromIndex * ITEM_WIDTH + NODE_SIZE / 2;
          const x2 = conn.toIndex * ITEM_WIDTH + NODE_SIZE / 2;

          // Distance check
          const dist = Math.abs(conn.toIndex - conn.fromIndex);
          const isLinear = dist === 1;

          // Arc height logic
          const arcHeight = isLinear ? 0 : Math.min(dist * 25, 80);

          let pathD = '';
          let labelX = 0;
          let labelY = 0;

          if (isLinear) {
            // Straight line between nodes (center-right to center-left)
            const startX = x1 + NODE_SIZE / 2 + 4;
            const endX = x2 - NODE_SIZE / 2 - 4;
            pathD = `M ${startX} ${MIDDLE_Y} L ${endX} ${MIDDLE_Y}`;

            labelX = (startX + endX) / 2;
            labelY = MIDDLE_Y - 12;
          } else {
            // Arc over nodes
            const startY = MIDDLE_Y - NODE_SIZE / 2;
            const endY = MIDDLE_Y - NODE_SIZE / 2;
            const midX = (x1 + x2) / 2;
            const controlY = startY - arcHeight * 1.5;

            pathD = `M ${x1} ${startY} Q ${midX} ${controlY} ${x2} ${endY}`;

            labelX = midX;
            labelY = startY - arcHeight * 0.75 - 10;
          }

          const strokeColors = {
            add: '#3b82f6',
            sub: '#ef4444',
            mul: '#f97316',
            pow: '#a855f7',
          };
          const colorClass = strokeColors[conn.type] || '#94a3b8';

          return (
            <g key={`conn-${conn.fromIndex}-${conn.toIndex}-${conn.type}`}>
              <path
                d={pathD}
                fill="none"
                stroke={colorClass}
                strokeWidth="2"
                strokeDasharray={conn.label === '...' ? '4 4' : '0'}
                className="transition-all duration-500"
              />

              {/* Label */}
              <foreignObject x={labelX - 25} y={labelY - 10} width="50" height="24">
                <div className="flex items-center justify-center w-full h-full">
                  <span
                    className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-slate-100 whitespace-nowrap"
                    style={{ color: colorClass }}
                  >
                    {conn.label}
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer */}
      {nodes.map((node, i) => (
        <div
          key={node.label || i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
          style={{ left: i * ITEM_WIDTH + NODE_SIZE / 2, top: MIDDLE_Y }}
        >
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold font-mono shadow-sm bg-white transition-all duration-300
                        ${
                          node.isPrediction
                            ? 'border-emerald-400 text-emerald-600 ring-4 ring-emerald-50 scale-110'
                            : 'border-slate-300 text-slate-700'
                        }`}
          >
            {node.value}
          </div>
          <div
            className={`absolute -bottom-8 w-max text-center text-[10px] font-mono font-medium
                        ${node.isPrediction ? 'text-emerald-600' : 'text-slate-600'}`}
          >
            {node.label || (node.isPrediction ? 'NEXT' : `i=${i}`)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResultSection;
