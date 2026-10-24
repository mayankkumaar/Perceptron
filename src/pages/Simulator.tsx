import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ParkingCanvas } from '../components/Car/ParkingCanvas';
import { WarningHUD } from '../components/Dashboard/WarningHUD';
import { OnScreenControls } from '../components/Car/OnScreenControls';
import { LivePerceptronExplainer } from '../components/Dashboard/LivePerceptronExplainer';
import { LEVELS } from '../game/levels';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Play,
  CheckCircle,
  AlertCircle,
  Target,
  Clock,
  Camera,
  Video,
  Sparkles,
  Info,
} from 'lucide-react';

export const Simulator: React.FC = () => {
  const currentLevelIndex = useStore((s) => s.currentLevelIndex);
  const setLevel = useStore((s) => s.setLevel);
  const resetVehicle = useStore((s) => s.resetVehicle);
  const gameStatus = useStore((s) => s.gameStatus);
  const vehicle = useStore((s) => s.vehicle);
  const score = useStore((s) => s.score);
  const elapsedTime = useStore((s) => s.elapsedTime);
  const metrics = useStore((s) => s.metrics);
  const cameraMode = useStore((s) => s.cameraMode);
  const setCameraMode = useStore((s) => s.setCameraMode);

  // Trigger celebration confetti on success
  useEffect(() => {
    if (gameStatus === 'success') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284C7', '#10B981', '#F59E0B', '#3B82F6'],
      });
    }
  }, [gameStatus]);

  const currentLevel = LEVELS[currentLevelIndex - 1] || LEVELS[0];

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Top Bar: Level Selection & Camera Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl cockpit-panel">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            PARKING LEVEL:
          </span>
          <div className="flex items-center gap-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition border ${
                  currentLevelIndex === lvl.id
                    ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                L{lvl.id}: {lvl.title.split(':')[1]?.trim() || lvl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Quick Toggles */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-2 uppercase font-semibold hidden sm:inline">Cam:</span>
          <button
            onClick={() => setCameraMode('tppBack')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              cameraMode === 'tppBack'
                ? 'bg-sky-500 text-white dark:bg-cyan-500/30 dark:text-cyan-300 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="TPP Back Camera: Chase view looking rearward over car towards obstacles"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>TPP Back Cam</span>
          </button>
          <button
            onClick={() => setCameraMode('backup')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              cameraMode === 'backup'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Rear Bumper Camera Feed with trajectory guidelines"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Bumper Cam</span>
          </button>
          <button
            onClick={() => setCameraMode('tpp')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              cameraMode === 'tpp'
                ? 'bg-sky-500 text-white dark:bg-cyan-500/30 dark:text-cyan-300 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Forward TPP Chase View"
          >
            <span>TPP Chase</span>
          </button>
        </div>

        {/* Live Stopwatch & Alignment */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">Time:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{elapsedTime.toFixed(1)}s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400">Bay Fit:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{vehicle.parkingProgress}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">Score:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Simulation Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D Viewport Column */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative w-full h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
            <ParkingCanvas />

            {/* In-Game Collision Flash Overlay */}
            {vehicle.collided && (
              <div className="absolute inset-0 bg-red-600/30 pointer-events-none animate-pulse flex items-center justify-center">
                <div className="px-4 py-2 rounded-xl bg-red-900/90 border border-red-400 text-white text-sm font-mono font-bold shadow-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-300" />
                  COLLISION DETECTED! VEHICLE STOPPED
                </div>
              </div>
            )}

            {/* Parking Success Modal Overlay */}
            {gameStatus === 'success' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-20">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-sky-400 dark:border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                    Parking Successful!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                    The Perceptron-guided ultrasonic system prevented obstacle impacts.
                  </p>

                  <div className="w-full grid grid-cols-2 gap-3 mb-6 text-xs font-mono">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block mb-1">ACCURACY</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-base">{vehicle.parkingProgress}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block mb-1">PARKING TIME</span>
                      <strong className="text-sky-600 dark:text-cyan-400 text-base">{elapsedTime.toFixed(1)}s</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block mb-1">COLLISIONS</span>
                      <strong className="text-slate-700 dark:text-slate-300 text-base">{metrics.collisions}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block mb-1">FINAL SCORE</span>
                      <strong className="text-amber-600 dark:text-amber-400 text-base">{score} pts</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={resetVehicle}
                      className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                    {currentLevelIndex < 3 && (
                      <button
                        onClick={() => setLevel(currentLevelIndex + 1)}
                        className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-mono font-bold shadow-md transition flex items-center justify-center gap-2"
                      >
                        Next Level <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* On-Screen Touch & Mouse Controls */}
          <OnScreenControls />
        </div>

        {/* Telemetry Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <WarningHUD />

          {/* Current Mission Brief */}
          <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4" /> MISSION BRIEF
              </span>
              <span className="text-slate-500">{currentLevel.difficulty}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
              {currentLevel.description}
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1">
              <div>🎯 <strong>Goal:</strong> Reverse and align the car inside the green target bay.</div>
              <div>⚡ <strong>Hazard Zone:</strong> Keep Perceptron Y = 0 during alignment.</div>
              <div>🚨 <strong>Emergency:</strong> Hit Spacebar to apply instant disc brakes.</div>
            </div>
          </div>

          {/* Quick Keyboard Reference */}
          <div className="cockpit-panel rounded-2xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300">
            <span className="text-[11px] text-slate-500 font-bold block mb-2 uppercase tracking-wider">
              Driving Controls
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">W</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">↑</kbd> Drive</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">S</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">↓</kbd> Reverse</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">A</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">←</kbd> Steer Left</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">D</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 font-bold">→</kbd> Steer Right</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-red-600 font-bold">Space</kbd> E-Brake</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">R</kbd> Reset Car</div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE PERCEPTRON DYNAMIC EXPLAINER SECTION */}
      <LivePerceptronExplainer />
    </div>
  );
};
