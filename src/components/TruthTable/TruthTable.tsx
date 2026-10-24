import React from 'react';
import { useStore } from '../../store/useStore';
import { OR_TRUTH_TABLE, computePerceptron } from '../../perceptron/model';
import { Table, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

export const TruthTable: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const sensors = useStore((s) => s.sensors);
  const setManualOverride = useStore((s) => s.setManualOverride);

  const activeX1 = perceptron.manualOverride ? perceptron.manualX1 : sensors.x1;
  const activeX2 = perceptron.manualOverride ? perceptron.manualX2 : sensors.x2;

  const handleRowClick = (x1: number, x2: number) => {
    setManualOverride(true, x1, x2);
  };

  const resetToLiveGame = () => {
    setManualOverride(false);
  };

  return (
    <div className="cockpit-panel rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            OR Gate Truth Table & Live State
          </h3>
        </div>
        {perceptron.manualOverride ? (
          <button
            onClick={resetToLiveGame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-sky-700 dark:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sync with Car Sensors
          </button>
        ) : (
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Telemetry Sync Active
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40">
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">X₁ (Zone 1)</th>
              <th className="py-2.5 px-3">X₂ (Zone 2)</th>
              <th className="py-2.5 px-3">Calculation (z)</th>
              <th className="py-2.5 px-3">Output Y</th>
              <th className="py-2.5 px-3">Warning Status</th>
              <th className="py-2.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {OR_TRUTH_TABLE.map((row, idx) => {
              const calc = computePerceptron(
                row.x1,
                row.x2,
                perceptron.w1,
                perceptron.w2,
                perceptron.bias
              );
              const isCurrent = activeX1 === row.x1 && activeX2 === row.x2;

              return (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row.x1, row.x2)}
                  className={`border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition ${
                    isCurrent
                      ? 'bg-sky-50 dark:bg-cyan-950/50 border-l-4 border-l-sky-500 dark:border-l-cyan-400 text-slate-900 dark:text-slate-100 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <td className="py-3 px-3 flex items-center gap-1.5">
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-cyan-400 animate-ping"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    )}
                    Row {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        row.x1 === 1
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {row.x1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        row.x2 === 1
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {row.x2}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    z = {calc.z} {calc.z >= 0 ? '(≥ 0)' : '(< 0)'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-extrabold ${
                        calc.y === 1
                          ? 'bg-red-100 dark:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      }`}
                    >
                      Y = {calc.y}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {calc.y === 1 ? (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        BUZZER ON
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        STANDBY
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row.x1, row.x2);
                      }}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-cyan-900 hover:text-sky-900 dark:hover:text-cyan-200 transition font-medium"
                    >
                      Test Row
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        💡 Click any row to force manual testing, or drive the car in the Simulator to trigger inputs dynamically.
      </p>
    </div>
  );
};
