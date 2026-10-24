import React, { useState } from 'react';
import { GATE_PRESETS, computePerceptron } from '../perceptron/model';
import { Binary, CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';

type GateKey = 'OR' | 'AND' | 'NOT' | 'NAND' | 'NOR' | 'XOR';

export const LogicExplorer: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateKey>('OR');
  const [inputA, setInputA] = useState<number>(1);
  const [inputB, setInputB] = useState<number>(0);

  // Compute live output for selected gate
  const computeGateOutput = (gate: GateKey, a: number, b: number): number => {
    switch (gate) {
      case 'OR':
        return a | b;
      case 'AND':
        return a & b;
      case 'NOT':
        return a === 1 ? 0 : 1;
      case 'NAND':
        return !(a & b) ? 1 : 0;
      case 'NOR':
        return !(a | b) ? 1 : 0;
      case 'XOR':
        return a ^ b;
    }
  };

  const currentOutput = computeGateOutput(selectedGate, inputA, inputB);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Logic Gate Explorer</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare fundamental digital logic gates, understand linear separability, and discover why single-neuron perceptrons can implement OR, AND, NAND, and NOR, but require multi-layer architectures for XOR.
          </p>
        </div>

        {selectedGate === 'OR' && (
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-cyan-950 border border-sky-300 dark:border-cyan-500/40 text-sky-800 dark:text-cyan-300 text-xs font-mono flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            Active in Smart Parking System
          </div>
        )}
      </div>

      {/* Gate Selector Ribbon */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        {(['OR', 'AND', 'NOT', 'NAND', 'NOR', 'XOR'] as GateKey[]).map((gate) => (
          <button
            key={gate}
            onClick={() => setSelectedGate(gate)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              selectedGate === gate
                ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md'
                : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span>{gate}</span>
            {gate === 'OR' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-slate-950 text-sky-800 dark:text-cyan-300">CORE</span>}
            {gate === 'XOR' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200">NON-LINEAR</span>}
          </button>
        ))}
      </div>

      {/* Main Interactive Gate Exploration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Logic Gate Schematic & Live Evaluator */}
        <div className="lg:col-span-7 cockpit-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedGate} Logic Gate
                </h3>
                <span className="text-xs font-mono text-sky-600 dark:text-cyan-400 font-semibold">
                  {selectedGate === 'OR' && 'Y = A + B (Disjunction)'}
                  {selectedGate === 'AND' && 'Y = A · B (Conjunction)'}
                  {selectedGate === 'NOT' && 'Y = ¬A (Inversion)'}
                  {selectedGate === 'NAND' && 'Y = ¬(A · B)'}
                  {selectedGate === 'NOR' && 'Y = ¬(A + B)'}
                  {selectedGate === 'XOR' && 'Y = A ⊕ B (Exclusive OR)'}
                </span>
              </div>

              {/* Separability Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                  selectedGate !== 'XOR'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                }`}
              >
                {selectedGate !== 'XOR' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Linearly Separable
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Non-Linearly Separable
                  </>
                )}
              </div>
            </div>

            {/* SVG Gate Graphic */}
            <div className="w-full aspect-[16/8] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4 shadow-inner">
              <svg viewBox="0 0 500 200" className="w-full h-full select-none">
                {/* Inputs Lines */}
                <line x1="60" y1="65" x2="180" y2="65" stroke={inputA === 1 ? '#00F0FF' : '#475569'} strokeWidth="4" />
                {selectedGate !== 'NOT' && (
                  <line x1="60" y1="135" x2="180" y2="135" stroke={inputB === 1 ? '#00F0FF' : '#475569'} strokeWidth="4" />
                )}

                {/* Gate Shape */}
                {selectedGate === 'OR' && (
                  <path
                    d="M 180 35 C 220 35, 270 50, 310 100 C 270 150, 220 165, 180 165 C 205 130, 205 70, 180 35 Z"
                    fill="#0F172A"
                    stroke="#00F0FF"
                    strokeWidth="3.5"
                  />
                )}
                {selectedGate === 'AND' && (
                  <path
                    d="M 180 35 L 240 35 C 285 35, 310 65, 310 100 C 310 135, 285 165, 240 165 L 180 165 Z"
                    fill="#0F172A"
                    stroke="#00F0FF"
                    strokeWidth="3.5"
                  />
                )}
                {selectedGate === 'NOT' && (
                  <g>
                    <polygon points="180,45 280,100 180,155" fill="#0F172A" stroke="#00F0FF" strokeWidth="3.5" />
                    <circle cx="292" cy="100" r="10" fill="#0F172A" stroke="#00F0FF" strokeWidth="3" />
                  </g>
                )}
                {selectedGate === 'NAND' && (
                  <g>
                    <path
                      d="M 180 35 L 240 35 C 285 35, 300 65, 300 100 C 300 135, 285 165, 240 165 L 180 165 Z"
                      fill="#0F172A"
                      stroke="#00F0FF"
                      strokeWidth="3.5"
                    />
                    <circle cx="312" cy="100" r="10" fill="#0F172A" stroke="#00F0FF" strokeWidth="3" />
                  </g>
                )}
                {selectedGate === 'NOR' && (
                  <g>
                    <path
                      d="M 180 35 C 220 35, 260 50, 295 100 C 260 150, 220 165, 180 165 C 205 130, 205 70, 180 35 Z"
                      fill="#0F172A"
                      stroke="#00F0FF"
                      strokeWidth="3.5"
                    />
                    <circle cx="308" cy="100" r="10" fill="#0F172A" stroke="#00F0FF" strokeWidth="3" />
                  </g>
                )}
                {selectedGate === 'XOR' && (
                  <g>
                    <path d="M 160 35 C 185 70, 185 130, 160 165" fill="none" stroke="#F59E0B" strokeWidth="3.5" />
                    <path
                      d="M 180 35 C 220 35, 270 50, 310 100 C 270 150, 220 165, 180 165 C 205 130, 205 70, 180 35 Z"
                      fill="#0F172A"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                    />
                  </g>
                )}

                {/* Output Line */}
                <line
                  x1={selectedGate === 'NOT' || selectedGate === 'NAND' || selectedGate === 'NOR' ? '325' : '310'}
                  y1="100"
                  x2="430"
                  y2="100"
                  stroke={currentOutput === 1 ? '#EF4444' : '#10B981'}
                  strokeWidth="5"
                />

                {/* Input Labels */}
                <text x="35" y="70" fill="#CBD5E1" fontSize="14" fontFamily="JetBrains Mono" fontWeight="bold">
                  A = {inputA}
                </text>
                {selectedGate !== 'NOT' && (
                  <text x="35" y="140" fill="#CBD5E1" fontSize="14" fontFamily="JetBrains Mono" fontWeight="bold">
                    B = {inputB}
                  </text>
                )}

                {/* Output Label */}
                <text x="445" y="105" fill={currentOutput === 1 ? '#EF4444' : '#10B981'} fontSize="18" fontFamily="JetBrains Mono" fontWeight="bold">
                  Y = {currentOutput}
                </text>
              </svg>
            </div>
          </div>

          {/* Interactive Input Toggle Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">TOGGLE INPUTS:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInputA(inputA === 1 ? 0 : 1)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                  inputA === 1
                    ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 border-sky-400 dark:border-cyan-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Input A: {inputA}
              </button>
              {selectedGate !== 'NOT' && (
                <button
                  onClick={() => setInputB(inputB === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    inputB === 1
                      ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 border-sky-400 dark:border-cyan-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Input B: {inputB}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Truth Table & Perceptron Feasibility Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Truth Table Card */}
          <div className="cockpit-panel rounded-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              {selectedGate} Truth Table
            </h4>
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2 px-3">Input A</th>
                  {selectedGate !== 'NOT' && <th className="py-2 px-3">Input B</th>}
                  <th className="py-2 px-3">Output Y</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGate === 'NOT'
                  ? [{ a: 0, b: 0, out: 1 }, { a: 1, b: 0, out: 0 }]
                  : [
                      { a: 0, b: 0, out: computeGateOutput(selectedGate, 0, 0) },
                      { a: 0, b: 1, out: computeGateOutput(selectedGate, 0, 1) },
                      { a: 1, b: 0, out: computeGateOutput(selectedGate, 1, 0) },
                      { a: 1, b: 1, out: computeGateOutput(selectedGate, 1, 1) },
                    ]
                ).map((row, idx) => {
                  const isActive = inputA === row.a && (selectedGate === 'NOT' || inputB === row.b);
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setInputA(row.a);
                        if (selectedGate !== 'NOT') setInputB(row.b);
                      }}
                      className={`border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition ${
                        isActive
                          ? 'bg-sky-50 dark:bg-cyan-950/60 font-bold text-sky-800 dark:text-cyan-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <td className="py-2.5 px-3">{row.a}</td>
                      {selectedGate !== 'NOT' && <td className="py-2.5 px-3">{row.b}</td>}
                      <td className="py-2.5 px-3 font-extrabold">{row.out}</td>
                      <td className="py-2.5 px-3">
                        {isActive ? (
                          <span className="text-sky-600 dark:text-cyan-400 text-[10px] uppercase font-bold">Current</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Select</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Single-Neuron Weights & Bias Configuration */}
          <div className="cockpit-panel rounded-2xl p-5 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> Single-Neuron Feasibility
            </h4>

            {selectedGate !== 'XOR' ? (
              <div className="text-xs font-mono space-y-2 text-slate-700 dark:text-slate-300">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Linearly Separable: Solvable with a single neuron.
                </p>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div>Weight 1 (w₁): <strong>{selectedGate === 'NOT' || selectedGate === 'NAND' || selectedGate === 'NOR' ? -1.0 : 1.0}</strong></div>
                  {selectedGate !== 'NOT' && (
                    <div>Weight 2 (w₂): <strong>{selectedGate === 'NAND' || selectedGate === 'NOR' ? -1.0 : 1.0}</strong></div>
                  )}
                  <div>
                    Bias (b):{' '}
                    <strong>
                      {selectedGate === 'OR' && '-0.5'}
                      {selectedGate === 'AND' && '-1.5'}
                      {selectedGate === 'NOT' && '0.5'}
                      {selectedGate === 'NAND' && '1.5'}
                      {selectedGate === 'NOR' && '0.5'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono space-y-2 text-slate-700 dark:text-slate-300">
                <p className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Minsky & Papert (1969) XOR Limitation:
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  A single straight decision hyperplane cannot separate (0,1) and (1,0) from (0,0) and (1,1).
                  Solving XOR requires at least a two-layer Multi-Layer Perceptron (MLP) with a hidden layer.
                </p>
              </div>
            )}
          </div>

          {/* Project Design Note */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-cyan-950/40 border border-sky-200 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-sky-800 dark:text-cyan-300 block mb-1">Why OR Logic for Parking?</strong>
            Automotive safety dictates fail-safe redundancy. If <em>either</em> the general zone ultrasonic sensor (S1) <em>or</em> the critical proximity sensor (S2) detects an obstacle, the vehicle must sound the alarm immediately.
          </div>
        </div>
      </div>
    </div>
  );
};
