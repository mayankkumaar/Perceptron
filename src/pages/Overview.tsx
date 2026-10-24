import React from 'react';
import { useStore } from '../store/useStore';
import {
  Play,
  Cpu,
  Radio,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { WarningHUD } from '../components/Dashboard/WarningHUD';
import { NeuronDiagram } from '../components/Perceptron/NeuronDiagram';

export const Overview: React.FC = () => {
  const setActivePage = useStore((s) => s.setActivePage);
  const vehicle = useStore((s) => s.vehicle);
  const sensors = useStore((s) => s.sensors);
  const perceptron = useStore((s) => s.perceptron);
  const metrics = useStore((s) => s.metrics);

  const speedKmh = Math.abs(Math.round(vehicle.speed * 3.6));
  const isWarningActive = perceptron.y === 1;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Banner with Automotive Dashboard Vibe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B132B] to-[#070D19] border border-cyan-500/20 p-8 shadow-panel-glass">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              AUTOMOTIVE EMBEDDED AI • SINGLE-NEURON CLASSIFIER
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
              Smart Parking Assistant
            </h1>
            <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
              Interactive Car Parking Simulator Powered by a Mathematically Accurate Single-Neuron Perceptron implementing an OR logic gate for real-time collision prevention.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                onClick={() => setActivePage('simulator')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-glow-cyan transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch 3D Parking Simulator
              </button>
              <button
                onClick={() => setActivePage('perceptron-lab')}
                className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                Inspect Perceptron Lab
              </button>
            </div>
          </div>

          {/* Quick HUD Widget */}
          <div className="w-full md:w-80">
            <WarningHUD />
          </div>
        </div>
      </div>

      {/* Key Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Speed */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>VEHICLE SPEED</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">{speedKmh}</span>
            <span className="text-xs text-slate-400 ml-1">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Gear: <strong className="text-slate-200">{vehicle.gear}</strong> | Heading: {(vehicle.heading * (180 / Math.PI)).toFixed(0)}°
          </div>
        </div>

        {/* Ultrasonic Sensors */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SENSORS X₁ & X₂</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2 flex items-baseline gap-3">
            <span className="text-lg font-mono font-bold text-slate-200">
              S1: <span className={sensors.x1 === 1 ? 'text-amber-400' : 'text-slate-400'}>{sensors.distance1}cm</span>
            </span>
            <span className="text-lg font-mono font-bold text-slate-200">
              S2: <span className={sensors.x2 === 1 ? 'text-red-400' : 'text-slate-400'}>{sensors.distance2}cm</span>
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Inputs: X₁={sensors.x1}, X₂={sensors.x2}
          </div>
        </div>

        {/* Perceptron Output */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PERCEPTRON OUTPUT</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2 flex items-center gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-100">Y = {perceptron.y}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                isWarningActive ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isWarningActive ? 'ALERT' : 'SAFE'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Weighted Sum: <strong className="text-slate-200">z = {perceptron.z}</strong>
          </div>
        </div>

        {/* Parking Score & Attempts */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PARKING SUCCESS</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {metrics.successfulAttempts}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {metrics.totalAttempts} attempts</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Collisions: <strong className="text-red-400">{metrics.collisions}</strong>
          </div>
        </div>
      </div>

      {/* Live System Architecture Diagram */}
      <div className="cockpit-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Live System Architecture & Data Flow
            </h3>
            <p className="text-xs text-slate-400">
              End-to-end signal processing pipeline from physical ultrasonic telemetry to driver alerts.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-1 rounded">
            Pipeline Active (60 Hz)
          </span>
        </div>

        {/* Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Node 1: Ultrasonic Sensors */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>STAGE 1</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Ultrasonic Waves</h4>
            <div className="text-xs font-mono text-slate-300">
              S1: {sensors.distance1} cm<br />
              S2: {sensors.distance2} cm
            </div>
            <div className="text-[10px] text-slate-500">Dual sonar beam reflection</div>
          </div>

          {/* Node 2: Binary Conversion */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>STAGE 2</span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Binary Quantization</h4>
            <div className="text-xs font-mono text-slate-300">
              X₁ = {sensors.x1} (≤100cm)<br />
              X₂ = {sensors.x2} (≤30cm)
            </div>
            <div className="text-[10px] text-slate-500">Threshold comparator</div>
          </div>

          {/* Node 3: Perceptron Summation */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-cyan-400 text-xs font-mono">
              <span>STAGE 3</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-bold text-cyan-300">Weighted Sum (∑)</h4>
            <div className="text-xs font-mono text-slate-200">
              z = w₁x₁ + w₂x₂ + b<br />
              <strong className={perceptron.z >= 0 ? 'text-amber-400' : 'text-cyan-400'}>z = {perceptron.z}</strong>
            </div>
            <div className="text-[10px] text-slate-400">Weights: 1.0, 1.0 | Bias: -0.5</div>
          </div>

          {/* Node 4: Step Activation */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>STAGE 4</span>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Step Activation</h4>
            <div className="text-xs font-mono text-slate-300">
              Y = 1 if z ≥ 0<br />
              <strong className={perceptron.y === 1 ? 'text-red-400' : 'text-emerald-400'}>Y = {perceptron.y}</strong>
            </div>
            <div className="text-[10px] text-slate-500">Heaviside threshold gate</div>
          </div>

          {/* Node 5: Driver Warnings */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 transition duration-300 ${
              isWarningActive
                ? 'bg-red-950/60 border-red-500/60 shadow-glow-red'
                : 'bg-emerald-950/40 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">STAGE 5</span>
              {isWarningActive ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-100">
              {isWarningActive ? 'Hazard Warning' : 'Safe Standby'}
            </h4>
            <div className="text-xs font-mono text-slate-300">
              Buzzer: {isWarningActive ? 'ACTIVE' : 'OFF'}<br />
              LED: {isWarningActive ? 'RED FLASH' : 'GREEN OK'}
            </div>
            <div className="text-[10px] text-slate-400">Multi-frequency audio cue</div>
          </div>
        </div>
      </div>

      {/* Embedded Quick Perceptron Diagram */}
      <NeuronDiagram />
    </div>
  );
};
