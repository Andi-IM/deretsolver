import React, { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { useLocation } from 'react-router-dom';
import { analytics } from '../utils/firebase';

function DocumentationPage() {
  const location = useLocation();
  useEffect(() => {
    logEvent(analytics, 'page_view', { page_path: location.pathname, page_title: 'Documentation' });
  }, [location]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-blue-500">menu_book</span>
        Documentation & Guide
      </h2>

      <div className="grid gap-12">
        {/* How to Use */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
              1
            </span>
            How to Use
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              Enter a sequence of numbers separated by commas or spaces (e.g.,{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-sm">
                2, 4, 6, 8
              </code>
              ). The solver will automatically detect the pattern and predict the next number.
            </p>
          </div>
        </section>

        {/* API Key Guide */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
              2
            </span>
            Complex Patterns & API Key
          </h3>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-amber-600 text-3xl shrink-0">
                vpn_key
              </span>
              <div className="space-y-3">
                <h4 className="font-bold text-amber-900 text-base">
                  Gemini API Key Required for Advanced Solving
                </h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  While basic patterns (Arithmetic, Geometric) work offline,{' '}
                  <strong>Complex, Interleaved, or Abstract patterns</strong> require Google's
                  Gemini AI.
                </p>
                <div className="pt-2">
                  <a
                    href="https://ai.google.dev/gemini-api/docs/api-key#import-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 font-bold text-sm rounded-lg border border-amber-200 shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    Get your Gemini API Key
                  </a>
                </div>
                <p className="text-xs text-amber-700/70 mt-2">
                  After getting the key, verify your project link and billing account if necessary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Patterns */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              3
            </span>
            Supported Patterns
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: 'Arithmetic Progression',
                desc: 'Adds/subtracts a constant value',
                ex: '2, 5, 8, 11',
              },
              {
                name: 'Geometric Progression',
                desc: 'Multiplies/divides by a constant',
                ex: '3, 6, 12, 24',
              },
              {
                name: 'Fibonacci Sequence',
                desc: 'Sum of previous two numbers',
                ex: '1, 1, 2, 3, 5',
              },
              {
                name: 'Triangular Numbers',
                desc: 'Adds increasing integers',
                ex: '1, 3, 6, 10, 15',
              },
              {
                name: 'Interleaved Sequences',
                desc: 'Two patterns alternating',
                ex: '1, 10, 2, 20, 3',
              },
              { name: 'Perfect Squares/Cubes', desc: 'Powers of integers', ex: '1, 4, 9, 16' },
              {
                name: 'Two-Level Difference',
                desc: 'Constant change in differences',
                ex: '1, 3, 6, 10',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <div className="font-bold text-slate-700 mb-1">{item.name}</div>
                  <div className="text-slate-500 text-xs mb-2">{item.desc}</div>
                  <code className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600 block w-fit">
                    {item.ex}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DocumentationPage;
