import React from 'react';
import { useStore } from '../../store/useStore';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const NeuronDiagram: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const sensors = useStore((s) => s.sensors);
  const setPerceptronParams = useStore((s) => s.setPerceptronParams);
  const setManualOverride = useStore((s) => s.setManualOverride);

  const x1 = perceptron.manualOverride ? perceptron.manualX1 : sensors.x1;
  const x2 = perceptron.manualOverride ? perceptron.manualX2 : sensors.x2;

  const w1 = perceptron.w1;
  const w2 = perceptron.w2;
  const bias = perceptron.bias;
  const z = perceptron.z;
  const y = perceptron.y;

  const isFiring = y === 1;

  // Preset handlers
  const setPresetOR = () => {
    setPerceptronParams(1.0, 1.0, -0.5);
  };
  const setPresetAND = () => {
    setPerceptronParams(1.0, 1.0, -1.5);
  };
  const resetDefaults = () => {
    setPerceptronParams(1.0, 1.0, -0.5);
    setManualOverride(false);
  };

  return (
    <div className="cockpit-panel rounded-2xl p-6 flex flex-col gap-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Artificial Neuron Architecture
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
              Heaviside Step Activation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feedforward inference: <span className="font-mono text-cyan-300">z = w₁x₁ + w₂x₂ + b</span>
          </p>
        </div>

        {/* Presets and Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={setPresetOR}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              w1 === 1.0 && w2 === 1.0 && bias === -0.5
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            OR Gate (Parking)
          </button>
          <button
            onClick={setPresetAND}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              w1 === 1.0 && w2 === 1.0 && bias === -1.5
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            AND Gate (Strict)
          </button>
          <button
            onClick={resetDefaults}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Reset Perceptron to Default Parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Interactive Schematic */}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
        <svg viewBox="0 0 860 340" className="w-full h-auto select-none">
          <defs>
            {/* Gradients */}
            <linearGradient id="axon-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="axon-inactive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="fire-output" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines */}
          {/* X1 to Summation */}
          <line
            x1="130"
            y1="90"
            x2="410"
            y2="170"
            stroke={x1 === 1 ? '#00F0FF' : '#334155'}
            strokeWidth={x1 === 1 ? '4' : '2'}
            strokeDasharray={x1 === 1 ? '6 4' : 'none'}
            className={x1 === 1 ? 'animate-pulse' : ''}
          />
          {/* X2 to Summation */}
          <line
            x1="130"
            y1="250"
            x2="410"
            y2="170"
            stroke={x2 === 1 ? '#00F0FF' : '#334155'}
            strokeWidth={x2 === 1 ? '4' : '2'}
            strokeDasharray={x2 === 1 ? '6 4' : 'none'}
            className={x2 === 1 ? 'animate-pulse' : ''}
          />
          {/* Bias to Summation */}
          <line
            x1="410"
            y1="290"
            x2="410"
            y2="215"
            stroke="#A855F7"
            strokeWidth="3"
            strokeDasharray="4 3"
          />
          {/* Summation to Activation */}
          <line
            x1="455"
            y1="170"
            x2="570"
            y2="170"
            stroke={z >= 0 ? '#F59E0B' : '#475569'}
            strokeWidth="4"
          />
          {/* Activation to Output Y */}
          <line
            x1="650"
            y1="170"
            x2="760"
            y2="170"
            stroke={isFiring ? '#EF4444' : '#10B981'}
            strokeWidth={isFiring ? '6' : '3'}
            filter={isFiring ? 'url(#glow-neon)' : undefined}
          />

          {/* Node 1: Input X1 */}
          <g transform="translate(100, 90)">
            <circle
              r="34"
              fill={x1 === 1 ? '#083344' : '#0F172A'}
              stroke={x1 === 1 ? '#00F0FF' : '#475569'}
              strokeWidth="2.5"
            />
            <text x="0" y="-8" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              INPUT X₁
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill={x1 === 1 ? '#00F0FF' : '#64748B'}
              fontSize="18"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
            >
              {x1}
            </text>
            <text x="0" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Sensor 1 (≤100cm)
            </text>
          </g>

          {/* Weight W1 Badge */}
          <g transform="translate(250, 115)">
            <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#0B132B" stroke="#00F0FF" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#00F0FF" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              w₁ = {w1}
            </text>
          </g>

          {/* Node 2: Input X2 */}
          <g transform="translate(100, 250)">
            <circle
              r="34"
              fill={x2 === 1 ? '#083344' : '#0F172A'}
              stroke={x2 === 1 ? '#00F0FF' : '#475569'}
              strokeWidth="2.5"
            />
            <text x="0" y="-8" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              INPUT X₂
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill={x2 === 1 ? '#00F0FF' : '#64748B'}
              fontSize="18"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
            >
              {x2}
            </text>
            <text x="0" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Sensor 2 (≤30cm)
            </text>
          </g>

          {/* Weight W2 Badge */}
          <g transform="translate(250, 225)">
            <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#0B132B" stroke="#00F0FF" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#00F0FF" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              w₂ = {w2}
            </text>
          </g>

          {/* Bias Input Node */}
          <g transform="translate(410, 305)">
            <rect x="-42" y="-15" width="84" height="30" rx="8" fill="#2E1065" stroke="#A855F7" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#D8B4FE" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              Bias b = {bias}
            </text>
          </g>

          {/* Summation Node (Sigma) */}
          <g transform="translate(410, 170)">
            <circle
              r="44"
              fill="#0F172A"
              stroke={z >= 0 ? '#F59E0B' : '#00F0FF'}
              strokeWidth="3"
              filter={z >= 0 ? 'url(#glow-neon)' : undefined}
            />
            <text x="0" y="-12" textAnchor="middle" fill="#94A3B8" fontSize="14" fontWeight="bold" fontFamily="serif">
              ∑
            </text>
            <text
              x="0"
              y="12"
              textAnchor="middle"
              fill={z >= 0 ? '#FDE047' : '#38BDF8'}
              fontSize="16"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
            >
              z = {z}
            </text>
            <text x="0" y="27" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
              w·x + b
            </text>
          </g>

          {/* Activation Function Node (Heaviside Step) */}
          <g transform="translate(610, 170)">
            <rect
              x="-42"
              y="-42"
              width="84"
              height="84"
              rx="12"
              fill="#0E1726"
              stroke={z >= 0 ? '#F59E0B' : '#475569'}
              strokeWidth="2.5"
            />
            {/* Step Function Icon */}
            <path d="M -26 22 L 0 22 L 0 -22 L 26 -22" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
            <circle cx={z >= 0 ? 14 : -14} cy={z >= 0 ? -22 : 22} r="5" fill={z >= 0 ? '#EF4444' : '#10B981'} />
            <text x="0" y="36" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono">
              Step(z)
            </text>
          </g>

          {/* Output Node Y */}
          <g transform="translate(790, 170)">
            <circle
              r="38"
              fill={isFiring ? '#450A0A' : '#064E3B'}
              stroke={isFiring ? '#EF4444' : '#10B981'}
              strokeWidth="3.5"
              filter={isFiring ? 'url(#glow-neon)' : undefined}
            />
            <text x="0" y="-10" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontFamily="JetBrains Mono">
              OUTPUT Y
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill={isFiring ? '#EF4444' : '#10B981'}
              fontSize="22"
              fontWeight="extrabold"
              fontFamily="JetBrains Mono"
            >
              {y}
            </text>
            <text
              x="0"
              y="52"
              textAnchor="middle"
              fill={isFiring ? '#F87171' : '#34D399'}
              fontSize="11"
              fontWeight="bold"
            >
              {isFiring ? 'WARNING ACTIVE' : 'SYSTEM STANDBY'}
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Parameter Sliders & Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weight 1 Slider */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono text-sky-700 dark:text-cyan-400 font-bold">Weight 1 (w₁)</label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-sky-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
              {w1.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="3.0"
            step="0.1"
            value={w1}
            onChange={(e) => setPerceptronParams(parseFloat(e.target.value), w2, bias)}
            className="w-full accent-sky-500 dark:accent-cyan-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Weight for Sensor 1 (General Zone obstacle)</p>
        </div>

        {/* Weight 2 Slider */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono text-sky-700 dark:text-cyan-400 font-bold">Weight 2 (w₂)</label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-sky-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
              {w2.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="3.0"
            step="0.1"
            value={w2}
            onChange={(e) => setPerceptronParams(w1, parseFloat(e.target.value), bias)}
            className="w-full accent-sky-500 dark:accent-cyan-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Weight for Sensor 2 (Critical Zone obstacle)</p>
        </div>

        {/* Bias Slider */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono text-purple-700 dark:text-purple-400 font-bold">Bias (b)</label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-purple-800 dark:text-purple-300 border border-slate-200 dark:border-slate-700">
              {bias.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-3.0"
            max="2.0"
            step="0.1"
            value={bias}
            onChange={(e) => setPerceptronParams(w1, w2, parseFloat(e.target.value))}
            className="w-full accent-purple-500 dark:accent-purple-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Activation threshold offset (negative shifts boundary)</p>
        </div>
      </div>

      {/* Manual Input Override for Direct Truth Table Testing */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
            <input
              type="checkbox"
              checked={perceptron.manualOverride}
              onChange={(e) => setManualOverride(e.target.checked)}
              className="accent-sky-500 dark:accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Manual Override Mode (Decouple from Car Physics)</span>
          </label>
        </div>

        {perceptron.manualOverride && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManualOverride(true, x1 === 1 ? 0 : 1, x2)}
              className={`px-3 py-1 rounded text-xs font-mono border transition ${
                x1 === 1 ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Toggle X₁: {x1}
            </button>
            <button
              onClick={() => setManualOverride(true, x1, x2 === 1 ? 0 : 1)}
              className={`px-3 py-1 rounded text-xs font-mono border transition ${
                x2 === 1 ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Toggle X₂: {x2}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
