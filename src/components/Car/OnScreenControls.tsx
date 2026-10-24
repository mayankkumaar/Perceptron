import React from 'react';
import { useStore } from '../../store/useStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Octagon, RotateCcw, Pause, Play } from 'lucide-react';

export const OnScreenControls: React.FC = () => {
  const setInputs = useStore((s) => s.setInputs);
  const resetVehicle = useStore((s) => s.resetVehicle);
  const togglePause = useStore((s) => s.togglePause);
  const gameStatus = useStore((s) => s.gameStatus);
  const inputs = useStore((s) => s.inputs);

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Steering Controls (Left / Right) */}
      <div className="flex items-center gap-2">
        <button
          onPointerDown={() => setInputs({ left: true })}
          onPointerUp={() => setInputs({ left: false })}
          onPointerLeave={() => setInputs({ left: false })}
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition shadow-sm active:scale-95 ${
            inputs.left
              ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 border-sky-400 dark:border-cyan-400 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Steer Left (A / Left Arrow)"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onPointerDown={() => setInputs({ right: true })}
          onPointerUp={() => setInputs({ right: false })}
          onPointerLeave={() => setInputs({ right: false })}
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition shadow-sm active:scale-95 ${
            inputs.right
              ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 border-sky-400 dark:border-cyan-400 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Steer Right (D / Right Arrow)"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Buttons (Reset, Pause) */}
      <div className="flex items-center gap-2">
        <button
          onClick={resetVehicle}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          title="Reset Car (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={togglePause}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          title="Pause / Resume (P)"
        >
          {gameStatus === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{gameStatus === 'paused' ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      {/* Pedals (Drive, Brake, Reverse) */}
      <div className="flex items-center gap-2">
        {/* Emergency Brake */}
        <button
          onPointerDown={() => setInputs({ brake: true })}
          onPointerUp={() => setInputs({ brake: false })}
          onPointerLeave={() => setInputs({ brake: false })}
          className={`px-3 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs border transition shadow-sm active:scale-95 gap-1 ${
            inputs.brake
              ? 'bg-red-600 text-white border-red-500 shadow-md'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
          }`}
          title="Emergency Brake (Space)"
          aria-label="Emergency Brake"
        >
          <Octagon className="w-4 h-4" />
          <span className="hidden sm:inline">BRAKE</span>
        </button>

        {/* Reverse Pedal */}
        <button
          onPointerDown={() => setInputs({ reverse: true })}
          onPointerUp={() => setInputs({ reverse: false })}
          onPointerLeave={() => setInputs({ reverse: false })}
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition shadow-sm active:scale-95 ${
            inputs.reverse
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Reverse (S / Down Arrow)"
          aria-label="Reverse"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Forward Drive Pedal */}
        <button
          onPointerDown={() => setInputs({ forward: true })}
          onPointerUp={() => setInputs({ forward: false })}
          onPointerLeave={() => setInputs({ forward: false })}
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition shadow-sm active:scale-95 ${
            inputs.forward
              ? 'bg-sky-500 text-white dark:bg-cyan-500 dark:text-slate-950 border-sky-400 dark:border-cyan-400 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Drive Forward (W / Up Arrow)"
          aria-label="Drive Forward"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
