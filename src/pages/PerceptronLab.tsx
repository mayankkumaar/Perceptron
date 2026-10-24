import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { NeuronDiagram } from '../components/Perceptron/NeuronDiagram';
import { TruthTable } from '../components/TruthTable/TruthTable';
import { DecisionBoundaryPlot } from '../components/Charts/DecisionBoundaryPlot';
import { computePerceptron, GATE_PRESETS } from '../perceptron/model';
import {
  Cpu,
  Zap,
  Binary,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  Sigma,
  Radio,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const PerceptronLab: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const sensors = useStore((s) => s.sensors);
  const setPerceptronParams = useStore((s) => s.setPerceptronParams);
  const setManualOverride = useStore((s) => s.setManualOverride);

  const [activeTab, setActiveTab] = useState<'schematic' | 'truth-table' | 'hyperplane' | 'math'>('schematic');

  const activeX1 = perceptron.manualOverride ? perceptron.manualX1 : sensors.x1;
  const activeX2 = perceptron.manualOverride ? perceptron.manualX2 : sensors.x2;

  const calc = computePerceptron(
    activeX1,
    activeX2,
    perceptron.w1,
    perceptron.w2,
    perceptron.bias
  );

  return (
    <div className="flex flex-col gap-6 pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Single-Neuron Perceptron Lab
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Explore how Frank Rosenblatt’s 1958 artificial neuron performs linear binary classification for fail-safe automotive obstacle avoidance using OR logic.
          </p>
        </div>

        {/* Live Activation Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">ACTIVATION:</span>
          <span
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm border ${
              calc.y === 1
                ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${calc.y === 1 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            Y = {calc.y} ({calc.y === 1 ? 'WARNING BUZZER ON' : 'STANDBY SILENT'})
          </span>
        </div>
      </div>

      {/* Lab Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab('schematic')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 font-bold ${
            activeTab === 'schematic'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 border border-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Neuron Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('truth-table')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 font-bold ${
            activeTab === 'truth-table'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 border border-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>Truth Table & Gates</span>
        </button>

        <button
          onClick={() => setActiveTab('hyperplane')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 font-bold ${
            activeTab === 'hyperplane'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 border border-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Decision Boundary Plot</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 font-bold ${
            activeTab === 'math'
              ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400 border border-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sigma className="w-4 h-4" />
          <span>Mathematical Derivation</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'schematic' && (
        <div className="flex flex-col gap-6">
          {/* Main Neuron Schematic */}
          <NeuronDiagram />

          {/* Step-by-Step Live Algebraic Calculation Breakdown */}
          <div className="cockpit-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                Live Feedforward Algebraic Calculation
              </h3>
              <span className="text-xs font-mono font-bold text-sky-700 dark:text-cyan-300">
                {calc.formulaString}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-1 font-semibold">1. SENSOR 1 WEIGHTING</span>
                <div className="text-slate-800 dark:text-slate-200">
                  w₁ × x₁ = {perceptron.w1} × {activeX1}
                </div>
                <div className="text-sky-600 dark:text-cyan-400 font-extrabold text-sm mt-1">= {calc.w1x1}</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-1 font-semibold">2. SENSOR 2 WEIGHTING</span>
                <div className="text-slate-800 dark:text-slate-200">
                  w₂ × x₂ = {perceptron.w2} × {activeX2}
                </div>
                <div className="text-sky-600 dark:text-cyan-400 font-extrabold text-sm mt-1">= {calc.w2x2}</div>
              </div>

              <div className="bg-sky-50/70 dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-200 dark:border-cyan-500/30">
                <span className="text-sky-800 dark:text-cyan-400 block mb-1 font-semibold">3. NET INPUT (z)</span>
                <div className="text-slate-800 dark:text-slate-200">
                  z = {calc.w1x1} + {calc.w2x2} {perceptron.bias >= 0 ? `+ ${perceptron.bias}` : `- ${Math.abs(perceptron.bias)}`}
                </div>
                <div className="text-sky-900 dark:text-amber-300 font-extrabold text-sm mt-1">= {calc.z}</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  calc.y === 1
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-500/50'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40'
                }`}
              >
                <span className="text-slate-500 block mb-1 font-semibold">4. HEAVISIDE STEP</span>
                <div className="text-slate-800 dark:text-slate-200">
                  {calc.z >= 0 ? `${calc.z} ≥ 0 ⟹ Y = 1` : `${calc.z} < 0 ⟹ Y = 0`}
                </div>
                <div
                  className={`font-bold mt-1 text-sm ${
                    calc.y === 1 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {calc.y === 1 ? 'TRIGGER BUZZER' : 'REMAIN SILENT'}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Mathematical Interpretation:</strong> {calc.stepExplanation}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'truth-table' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <TruthTable />
          </div>
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Why Fail-Safe OR Gate is Mandatory for Automotive Safety
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                In car parking systems, rear sensors are spaced across the bumper to cover the driver's blind spots. If a narrow obstacle (such as a concrete pillar, bollard, or child) enters the left sensor cone but misses the right sensor cone:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span><strong>OR Gate:</strong> Input [1, 0] produces Output Y = 1. The alarm sounds, preventing the collision.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <span><strong>AND Gate:</strong> Input [1, 0] produces Output Y = 0. The car reverses into the obstacle in complete silence.</span>
                </li>
              </ul>
            </div>

            {/* Gate Presets */}
            <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Load Standard Perceptron Gate Presets
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {Object.entries(GATE_PRESETS).map(([name, config]) => (
                  <button
                    key={name}
                    onClick={() => setPerceptronParams(config.w1, config.w2, config.bias)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-400 text-left transition"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{name} Gate</span>
                      {config.separable ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Separable</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">Non-Linear</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      w₁={config.w1}, w₂={config.w2}, b={config.bias}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hyperplane' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <DecisionBoundaryPlot />
          </div>
          <div className="lg:col-span-5 cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                Hyperplane Equation in 2D Feature Space
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                The decision boundary is the line where the perceptron's net input equals zero:
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-sky-700 dark:text-cyan-300 font-bold mb-3">
                w₁ x₁ + w₂ x₂ + b = 0
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                Solving for x₂ yields the slope-intercept form:
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-700 dark:text-amber-300 font-bold">
                x₂ = (-w₁ / w₂) · x₁ - (b / w₂)
              </div>
              <div className="mt-3 text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
                <div>Slope: <strong>{perceptron.w2 !== 0 ? (-perceptron.w1 / perceptron.w2).toFixed(2) : 'Undefined'}</strong></div>
                <div>Intercept: <strong>{perceptron.w2 !== 0 ? (-perceptron.bias / perceptron.w2).toFixed(2) : 'N/A'}</strong></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              Any point on or above this line produces z ≥ 0 (Output Y = 1: Hazard Alarm).
            </div>
          </div>
        </div>
      )}

      {activeTab === 'math' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400">01 • INPUT FEATURES</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Vector x ∈ &#123;0, 1&#125;²</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              Binary sensor signals from ultrasonic transducers. x₁ represents general obstacle zone (≤100 cm), x₂ represents critical proximity zone (≤30 cm).
            </p>
          </div>

          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400">02 • SYNAPTIC WEIGHTS</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Weight Vector w = [w₁, w₂]</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              Weights quantify sensor channel importance. Equal weights w₁ = 1.0, w₂ = 1.0 reflect symmetric safety importance for both ultrasonic beams.
            </p>
          </div>

          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">03 • THRESHOLD BIAS</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Scalar Bias b = -0.5</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              Offsets the activation threshold. Setting b = -0.5 ensures that if both inputs are 0, z = -0.5 &lt; 0 (Silent), but if either input is 1, z = +0.5 ≥ 0 (Active).
            </p>
          </div>

          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400">04 • DOT PRODUCT</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">z = wᵀx + b</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              The affine linear combination summing weighted inputs with the scalar bias. Maps the 2D input space to a 1D decision coordinate.
            </p>
          </div>

          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">05 • HEAVISIDE STEP</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Y = H(z) ∈ &#123;0, 1&#125;</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              Step activation function: returns 1 if z ≥ 0, and 0 if z &lt; 0. Emulates the biological all-or-nothing action potential firing of a neuron.
            </p>
          </div>

          <div className="cockpit-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400">06 • ULTRASONIC PHYSICS</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Echo Time t = 2d / v</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
              Transducers emit 40 kHz acoustic pulses. Traveling at sound velocity v = 343 m/s, the round-trip flight time yields distance d = (v · t) / 2.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
