import React from 'react';
import { useStore } from '../../store/useStore';
import { AlertTriangle, ShieldCheck, Volume2, VolumeX, Gauge, Zap } from 'lucide-react';

export const WarningHUD: React.FC = () => {
  const vehicle = useStore((s) => s.vehicle);
  const sensors = useStore((s) => s.sensors);
  const perceptron = useStore((s) => s.perceptron);
  const sound = useStore((s) => s.sound);
  const setSoundConfig = useStore((s) => s.setSoundConfig);

  const speedKmh = Math.abs(Math.round(vehicle.speed * 3.6));
  const isWarningActive = perceptron.y === 1;
  const isCritical = sensors.nearestDistance <= sensors.threshold2;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Warning Banner */}
      <div
        className={`rounded-xl p-3.5 border transition-all duration-300 flex items-center justify-between shadow-md ${
          isWarningActive
            ? isCritical
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-500/70 animate-pulse-fast'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/60'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${
              isWarningActive
                ? isCritical
                  ? 'bg-red-500 text-white animate-bounce'
                  : 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isWarningActive ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold">
                PARKING SYSTEM STATUS
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isWarningActive
                    ? 'bg-red-100 dark:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                PERCEPTRON Y = {perceptron.y}
              </span>
            </div>
            <div className="text-base font-extrabold tracking-tight mt-0.5">
              {isWarningActive ? (
                <span className={isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                  {isCritical ? 'CRITICAL PROXIMITY HAZARD' : 'OBSTACLE DETECTED — CAUTION'}
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400">SAFE CLEARANCE — ALL CLEAR</span>
              )}
            </div>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={() => setSoundConfig({ muted: !sound.muted })}
          className={`p-2 rounded-lg border transition ${
            sound.muted
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white'
              : 'bg-sky-50 dark:bg-cyan-950/60 border-sky-300 dark:border-cyan-500/40 text-sky-700 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-cyan-900/60 shadow-sm'
          }`}
          title={sound.muted ? 'Unmute Audio' : 'Mute Warning Audio'}
        >
          {sound.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-4 gap-2">
        {/* Speed & Gear */}
        <div className="cockpit-panel rounded-lg p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
            <Gauge className="w-3 h-3 text-sky-500 dark:text-cyan-400" /> SPEED
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-mono font-extrabold text-sky-700 dark:text-cyan-300">{speedKmh}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">km/h</span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.2 rounded mt-1 font-bold ${
              vehicle.gear === 'R'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : vehicle.gear === 'D'
                ? 'bg-sky-100 dark:bg-cyan-500/30 text-sky-800 dark:text-cyan-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            GEAR: {vehicle.gear}
          </span>
        </div>

        {/* Distance to Nearest Obstacle */}
        <div className="cockpit-panel rounded-lg p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">MIN DISTANCE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-mono font-extrabold ${
                sensors.nearestDistance <= 30
                  ? 'text-red-600 dark:text-red-400 animate-pulse'
                  : sensors.nearestDistance <= 100
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {sensors.nearestDistance < 250 ? sensors.nearestDistance : '> 250'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">cm</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
            {sensors.nearestDistance <= 30 ? 'CRITICAL' : sensors.nearestDistance <= 100 ? 'WARNING' : 'CLEAR'}
          </span>
        </div>

        {/* Sensor 1 & X1 */}
        <div className="cockpit-panel rounded-lg p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">SENSOR 1 (100cm)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">{sensors.distance1}cm</span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded mt-1 font-bold ${
              sensors.x1 === 1
                ? 'bg-amber-100 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            X₁ = {sensors.x1}
          </span>
        </div>

        {/* Sensor 2 & X2 */}
        <div className="cockpit-panel rounded-lg p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">SENSOR 2 (30cm)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">{sensors.distance2}cm</span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded mt-1 font-bold ${
              sensors.x2 === 1
                ? 'bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            X₂ = {sensors.x2}
          </span>
        </div>
      </div>

      {/* Perceptron Mathematical Fast Readout */}
      <div className="cockpit-panel rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <span className="text-slate-800 dark:text-slate-200">
            z = ({perceptron.w1}×{perceptron.manualOverride ? perceptron.manualX1 : sensors.x1}) + (
            {perceptron.w2}×{perceptron.manualOverride ? perceptron.manualX2 : sensors.x2}){' '}
            {perceptron.bias >= 0 ? `+ ${perceptron.bias}` : `- ${Math.abs(perceptron.bias)}`} ={' '}
            <strong className={perceptron.z >= 0 ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
              {perceptron.z}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Step(z) ⟹</span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              perceptron.y === 1
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Y = {perceptron.y}
          </span>
        </div>
      </div>
    </div>
  );
};
