import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Activity,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  RotateCcw,
  Volume2,
} from 'lucide-react';

export const LivePerceptronExplainer: React.FC = () => {
  const vehicle = useStore((s) => s.vehicle);
  const sensors = useStore((s) => s.sensors);
  const perceptron = useStore((s) => s.perceptron);
  const setPerceptronParams = useStore((s) => s.setPerceptronParams);
  const setManualOverride = useStore((s) => s.setManualOverride);

  // Local interactive test slider (allows user to drag virtual obstacle distance dynamically)
  const [testSliderActive, setTestSliderActive] = useState(false);
  const [testDistance, setTestDistance] = useState(140);

  // Compute active inputs depending on test slider or live car sensors
  let activeDist = sensors.nearestDistance;
  let activeX1 = sensors.x1;
  let activeX2 = sensors.x2;

  if (testSliderActive) {
    activeDist = testDistance;
    activeX1 = testDistance <= sensors.threshold1 ? 1 : 0;
    activeX2 = testDistance <= sensors.threshold2 ? 1 : 0;
  } else if (perceptron.manualOverride) {
    activeX1 = perceptron.manualX1;
    activeX2 = perceptron.manualX2;
  }

  const w1 = perceptron.w1;
  const w2 = perceptron.w2;
  const bias = perceptron.bias;

  // Real-time perceptron math
  const w1x1 = +(w1 * activeX1).toFixed(2);
  const w2x2 = +(w2 * activeX2).toFixed(2);
  const z = +(w1x1 + w2x2 + bias).toFixed(2);
  const y = z >= 0 ? 1 : 0;

  const isWarning = y === 1;
  const isCritical = activeDist <= sensors.threshold2;

  // Ultrasonic echo time: t = 2d / v (v = 343 m/s)
  const echoTimeMs = ((2 * (activeDist / 100)) / 343 * 1000).toFixed(2);

  // Determine current vehicle movement context
  let movementState = 'Vehicle Stationary / In Bay';
  if (Math.abs(vehicle.speed) > 0.05) {
    if (vehicle.gear === 'R') movementState = `Reversing at ${Math.abs(Math.round(vehicle.speed * 3.6))} km/h`;
    else if (vehicle.gear === 'D') movementState = `Driving Forward at ${Math.abs(Math.round(vehicle.speed * 3.6))} km/h`;
  }

  // Dynamic context-aware natural language explanation of what is actually happening
  let dynamicReasoning = '';
  if (activeX1 === 0 && activeX2 === 0) {
    dynamicReasoning = `Both ultrasonic sensors report clear space (> ${sensors.threshold1} cm). Because neither beam detects an obstacle within danger distance, the quantized inputs are X₁ = 0 and X₂ = 0. The weighted sum evaluates to z = (${w1} × 0) + (${w2} × 0) + (${bias}) = ${z}. Because ${z} < 0, the Heaviside step activation threshold is not met (Y = 0), keeping the cockpit warning buzzer silent.`;
  } else if (activeX1 === 1 && activeX2 === 0) {
    dynamicReasoning = `Obstacle detected at ${activeDist} cm, breaching the ${sensors.threshold1} cm warning perimeter (X₁ = 1), while critical distance (> ${sensors.threshold2} cm) remains safe (X₂ = 0). Under fail-safe OR logic (w₁ = ${w1}, w₂ = ${w2}, b = ${bias}), just one active sensor produces z = (${w1} × 1) + (${w2} × 0) + (${bias}) = ${z}. Because ${z} ≥ 0, the single perceptron fires Y = 1, immediately pulsing the audio buzzer (4 beeps/sec) to alert the driver before impact!`;
  } else if (activeX1 === 1 && activeX2 === 1) {
    dynamicReasoning = `CRITICAL PROXIMITY HAZARD! The vehicle is only ${activeDist} cm from the obstacle, breaching the ${sensors.threshold2} cm emergency threshold (both X₁ = 1 and X₂ = 1). The weighted sum reaches z = (${w1} × 1) + (${w2} × 1) + (${bias}) = ${z}. Since ${z} ≥ 0, the perceptron fires Y = 1, driving rapid 1350 Hz alarm pulses and cockpit emergency hazard alert!`;
  } else {
    dynamicReasoning = `Critical proximity transducer triggered (X₂ = 1). The weighted sum is z = (${w1} × 0) + (${w2} × 1) + (${bias}) = ${z} ≥ 0, which activates Y = 1 to guarantee fail-safe vehicle stopping.`;
  }

  return (
    <div className="cockpit-panel rounded-2xl p-5 flex flex-col gap-5 border border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
      {/* Top Header: System Status & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-cyan-950/80 border border-sky-200 dark:border-cyan-500/40 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              What Is Actually Happening in the Parking Simulator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE 60 FPS
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Vehicle State: <strong className="text-slate-800 dark:text-slate-200">{movementState}</strong> • Ultrasonic Echo Time: <strong className="text-slate-800 dark:text-slate-200">{echoTimeMs} ms</strong>
            </p>
          </div>
        </div>

        {/* Logic Mode Toggle (OR Gate vs AND Gate) */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold hidden sm:inline">Perceptron Gate:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <button
              onClick={() => setPerceptronParams(1.0, 1.0, -0.5)}
              className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] ${
                w1 === 1.0 && w2 === 1.0 && bias === -0.5
                  ? 'bg-sky-500 text-white dark:bg-cyan-500/30 dark:text-cyan-300 dark:border-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Fail-Safe Automotive OR Gate: Warning triggers if EITHER sensor detects obstacle"
            >
              OR Logic (Fail-Safe)
            </button>
            <button
              onClick={() => setPerceptronParams(1.0, 1.0, -1.5)}
              className={`px-2.5 py-1 rounded-lg transition font-bold text-[11px] ${
                w1 === 1.0 && w2 === 1.0 && bias === -1.5
                  ? 'bg-sky-500 text-white dark:bg-cyan-500/30 dark:text-cyan-300 dark:border-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Strict AND Gate: Warning triggers ONLY if BOTH sensors detect obstacle simultaneously"
            >
              AND Logic (Strict)
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Mathematical Data Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Step 1: Physical Sonar Distance */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>STEP 1: SONAR ECHO</span>
              <Radio className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>Left Transducer:</span>
                <strong className="text-slate-900 dark:text-white">{testSliderActive ? activeDist : sensors.distance1} cm</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Right Transducer:</span>
                <strong className="text-slate-900 dark:text-white">{testSliderActive ? activeDist : sensors.distance2} cm</strong>
              </div>
            </div>
          </div>
          <div className="mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>Nearest Obstacle:</span>
            <strong className={activeDist <= 30 ? 'text-red-600 dark:text-red-400 font-bold' : activeDist <= 100 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
              {activeDist} cm
            </strong>
          </div>
        </div>

        {/* Step 2: Binary Inputs X1 & X2 */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>STEP 2: BINARY QUANTIZATION</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">X₁ (d ≤ {sensors.threshold1}cm):</span>
                <span className={`px-2 py-0.5 rounded font-bold font-mono text-xs ${activeX1 === 1 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {activeX1}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">X₂ (d ≤ {sensors.threshold2}cm):</span>
                <span className={`px-2 py-0.5 rounded font-bold font-mono text-xs ${activeX2 === 1 ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {activeX2}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Feature Vector: <strong className="text-slate-800 dark:text-slate-200">x = [{activeX1}, {activeX2}]</strong>
          </div>
        </div>

        {/* Step 3: Dot Product & Net Sum z */}
        <div className="bg-sky-50/70 dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-200 dark:border-cyan-500/30 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-800 dark:text-cyan-400 mb-1.5">
              <span>STEP 3: NET INPUT (z = wᵀx + b)</span>
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            </div>
            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 leading-tight">
              z = ({w1}×{activeX1}) + ({w2}×{activeX2}) {bias >= 0 ? `+ ${bias}` : `- ${Math.abs(bias)}`}
            </div>
            <div className="mt-1.5 text-lg font-extrabold font-mono text-sky-900 dark:text-amber-300">
              z = {z}
            </div>
          </div>
          <div className="mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-sky-200 dark:border-slate-800">
            Weights: [{w1}, {w2}], Bias: {bias}
          </div>
        </div>

        {/* Step 4: Heaviside Step Activation */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors shadow-sm ${
            isWarning
              ? isCritical
                ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-500/60'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/60'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1.5">
              <span className={isWarning ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}>
                STEP 4: STEP ACTIVATION Y
              </span>
              {isWarning ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              Y = Step({z}) = <span className="text-lg text-red-600 dark:text-red-400 font-extrabold">{y}</span>
            </div>
            <div className="text-[11px] font-bold font-mono mt-0.5">
              {isWarning ? (
                <span className={isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                  {isCritical ? 'CRITICAL BUZZER (1350 Hz)' : 'WARNING PULSE (4 Hz)'}
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400">SAFE (SILENT STANDBY)</span>
              )}
            </div>
          </div>
          <div className="mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Condition: {z >= 0 ? 'z ≥ 0 (Threshold Reached)' : 'z < 0 (Below Threshold)'}
          </div>
        </div>
      </div>

      {/* Dynamic Context-Aware Natural Language Explanation */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-bold block mb-1">
            Dynamic Automotive Perceptron Analysis:
          </strong>
          {dynamicReasoning}
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <strong>Why Fail-Safe OR Gate?</strong> In automotive collision avoidance, if <em>either</em> the left sensor or right sensor detects a wall, column, or pedestrian, the car must trigger an alert immediately. Using an AND gate would be hazardous because it would only beep if both sensors detected an obstacle simultaneously!
          </div>
        </div>
      </div>

      {/* Dynamic Interactive Distance Slider (Test Any Distance in Real Time!) */}
      <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-slate-900/40 border border-sky-200 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            INTERACTIVE DISTANCE SIMULATOR SLIDER (Test Perceptron Dynamically):
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTestSliderActive(!testSliderActive)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                testSliderActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {testSliderActive ? 'Slider Active (Manual Test)' : 'Enable Slider Test'}
            </button>
            {testSliderActive && (
              <button
                onClick={() => setTestSliderActive(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                title="Return to Live Car Telemetry"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {testSliderActive ? (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Virtual Distance to Wall:</span>
              <strong className="text-sky-700 dark:text-cyan-400 text-sm">{testDistance} cm</strong>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="1"
              value={testDistance}
              onChange={(e) => setTestDistance(Number(e.target.value))}
              className="w-full accent-sky-500 dark:accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="text-red-600 dark:text-red-400 font-bold">10cm (Critical ≤30)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">100cm (Warning Threshold)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">250cm (Clear)</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Currently driven by live 3D car sensors. Click <strong>"Enable Slider Test"</strong> to drag the virtual obstacle distance with your mouse and see the single perceptron recalculate instantaneously!
          </p>
        )}
      </div>
    </div>
  );
};
