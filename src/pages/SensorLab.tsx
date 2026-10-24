import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Radio, Sliders, AlertTriangle, ShieldCheck, Zap, Activity, Info, Volume2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export const SensorLab: React.FC = () => {
  const sensors = useStore((s) => s.sensors);
  const setSensorThresholds = useStore((s) => s.setSensorThresholds);
  const perceptron = useStore((s) => s.perceptron);

  // Standalone probe distance for lab experimentation
  const [labProbeDistance, setLabProbeDistance] = useState<number>(75);
  const [useLiveTelemetry, setUseLiveTelemetry] = useState<boolean>(true);

  const activeDistance = useLiveTelemetry ? sensors.nearestDistance : labProbeDistance;
  const th1 = sensors.threshold1;
  const th2 = sensors.threshold2;

  // Calculate binary inputs
  const x1 = activeDistance <= th1 ? 1 : 0;
  const x2 = activeDistance <= th2 ? 1 : 0;

  // Time of Flight calculation (speed of sound = 343 m/s = 0.0343 cm/us)
  const timeOfFlightMicroseconds = Math.round((2 * activeDistance) / 0.0343);

  // Play test beep
  const triggerLabBeep = () => {
    soundManager.playBeep(activeDistance <= th2 ? 1350 : 900, 0.1);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ultrasonic Sensor Laboratory</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate 40 kHz ultrasonic Time-of-Flight (ToF) echo ranging, threshold quantization, and binary signal conditioning.
          </p>
        </div>

        {/* Live vs Interactive Probe Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <button
            onClick={() => setUseLiveTelemetry(true)}
            className={`px-3 py-1.5 rounded-lg transition ${
              useLiveTelemetry
                ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📡 Live Car Telemetry
          </button>
          <button
            onClick={() => setUseLiveTelemetry(false)}
            className={`px-3 py-1.5 rounded-lg transition ${
              !useLiveTelemetry
                ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔬 Manual Lab Probe
          </button>
        </div>
      </div>

      {/* Main Radar Oscilloscope & Sonar Wave Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sonar Beam Graphic Display */}
        <div className="lg:col-span-7 cockpit-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> REAR TRANSDUCER SONAR SCANNER
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                activeDistance <= th2
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40 animate-pulse'
                  : activeDistance <= th1
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                  : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
              }`}
            >
              {activeDistance <= th2 ? 'CRITICAL PROXIMITY' : activeDistance <= th1 ? 'OBSTACLE DETECTED' : 'CLEAR ZONE'}
            </span>
          </div>

          {/* SVG Animated Radar Cone */}
          <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 600 320" className="w-full h-full select-none">
              {/* Distance Concentric Arcs */}
              <circle cx="300" cy="40" r="80" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="300" cy="40" r="160" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="300" cy="40" r="240" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />

              <text x="305" y="125" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono">30 cm (Critical)</text>
              <text x="305" y="205" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono">100 cm (Warning)</text>
              <text x="305" y="285" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono">200 cm (Safe)</text>

              {/* Sonar Beam Cones */}
              <path
                d="M 270 40 L 100 290 L 500 290 Z"
                fill={
                  activeDistance <= th2
                    ? 'rgba(239, 68, 68, 0.15)'
                    : activeDistance <= th1
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(0, 240, 255, 0.08)'
                }
                stroke={
                  activeDistance <= th2
                    ? '#EF4444'
                    : activeDistance <= th1
                    ? '#F59E0B'
                    : '#00F0FF'
                }
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Vehicle Rear Bumper Representation */}
              <rect x="230" y="10" width="140" height="30" rx="8" fill="#1E293B" stroke="#00F0FF" strokeWidth="2" />
              <text x="300" y="28" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                REAR BUMPER
              </text>

              {/* Transducer 1 (Left) */}
              <circle cx="260" cy="38" r="6" fill="#00F0FF" />
              {/* Transducer 2 (Right) */}
              <circle cx="340" cy="38" r="6" fill="#00F0FF" />

              {/* Detected Obstacle Marker (Positioned based on distance) */}
              {activeDistance < 250 && (
                <g transform={`translate(300, ${40 + (activeDistance / 250) * 230})`}>
                  <rect
                    x="-40"
                    y="-10"
                    width="80"
                    height="20"
                    rx="4"
                    fill={activeDistance <= th2 ? '#EF4444' : activeDistance <= th1 ? '#F59E0B' : '#10B981'}
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#FFF" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    OBSTACLE ({activeDistance} cm)
                  </text>
                  <circle cx="0" cy="0" r="30" fill="none" stroke="#FFF" strokeWidth="1" className="animate-ping" />
                </g>
              )}
            </svg>

            {/* Live Distance Overlay Badge */}
            <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono shadow-md">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">MEASURED DISTANCE:</span>
              <span
                className={`text-base font-extrabold ${
                  activeDistance <= th2 ? 'text-red-600 dark:text-red-400' : activeDistance <= th1 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {activeDistance} cm
              </span>
            </div>
          </div>

          {/* Test Audio Button */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Sound Cadence: {activeDistance <= th2 ? 'Fast High-Pitch (1350 Hz)' : activeDistance <= th1 ? 'Medium Intermittent (900 Hz)' : 'Silent Standby'}
            </span>
            <button
              onClick={triggerLabBeep}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-sky-700 dark:text-cyan-300 flex items-center gap-1.5 transition font-medium border border-slate-200 dark:border-slate-700"
            >
              <Volume2 className="w-3.5 h-3.5" /> Test Sonar Tone
            </button>
          </div>
        </div>

        {/* Signal Conditioning & Quantization Parameters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Manual Probe Slider (If manual mode active) */}
          {!useLiveTelemetry && (
            <div className="cockpit-panel rounded-2xl p-4 border border-sky-300 dark:border-cyan-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-sky-800 dark:text-cyan-300">
                  Virtual Test Obstacle Distance
                </span>
                <span className="text-sm font-mono font-extrabold text-sky-900 dark:text-cyan-400 bg-sky-100 dark:bg-cyan-950 px-2 py-0.5 rounded border border-sky-300 dark:border-cyan-800">
                  {labProbeDistance} cm
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                value={labProbeDistance}
                onChange={(e) => setLabProbeDistance(parseInt(e.target.value))}
                className="w-full accent-sky-500 dark:accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0 cm (Bumper)</span>
                <span>100 cm</span>
                <span>250 cm (Max Range)</span>
              </div>
            </div>
          )}

          {/* Threshold Configurations */}
          <div className="cockpit-panel rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> Configurable Threshold Comparators
            </h4>

            {/* Threshold 1 Slider (Sensor 1) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-600 dark:text-amber-400 font-bold">Threshold 1 (General Zone):</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{th1} cm</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={th1}
                onChange={(e) => setSensorThresholds(parseInt(e.target.value), th2)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Triggers X₁ = 1 whenever obstacle distance ≤ {th1} cm
              </span>
            </div>

            {/* Threshold 2 Slider (Sensor 2) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-red-600 dark:text-red-400 font-bold">Threshold 2 (Critical Zone):</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{th2} cm</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={th2}
                onChange={(e) => setSensorThresholds(th1, parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Triggers X₂ = 1 whenever obstacle distance ≤ {th2} cm
              </span>
            </div>
          </div>

          {/* Binary Quantization Output Panel */}
          <div className="cockpit-panel rounded-2xl p-5 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> Quantized Binary Inputs to Perceptron
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1 font-bold">SENSOR 1 (≤{th1}cm)</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Distance: {activeDistance} cm</div>
                <div className={`mt-1 font-extrabold ${x1 === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  X₁ = {x1} {x1 === 1 ? '(DETECTED)' : '(CLEAR)'}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1 font-bold">SENSOR 2 (≤{th2}cm)</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Distance: {activeDistance} cm</div>
                <div className={`mt-1 font-extrabold ${x2 === 1 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  X₂ = {x2} {x2 === 1 ? '(CRITICAL)' : '(CLEAR)'}
                </div>
              </div>
            </div>

            {/* Time of Flight Physics Note */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              ⏱️ <strong>Time-of-Flight (ToF):</strong> Echo transit time Δt = 2d / c = {timeOfFlightMicroseconds} µs (assuming c = 343 m/s at 20°C).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
