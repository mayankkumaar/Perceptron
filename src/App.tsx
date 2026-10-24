import React from 'react';
import { useStore } from './store/useStore';
import { PageId } from './types';
import {
  Car,
  Cpu,
  Radio,
  Binary,
  Sigma,
  ShieldCheck,
  BookOpen,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Simulator } from './pages/Simulator';
import { PerceptronLab } from './pages/PerceptronLab';
import { SensorLab } from './pages/SensorLab';
import { LogicExplorer } from './pages/LogicExplorer';
import { Mathematics } from './pages/Mathematics';
import { Testing } from './pages/Testing';
import { Documentation } from './pages/Documentation';

export const App: React.FC = () => {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);
  const perceptron = useStore((s) => s.perceptron);
  const sound = useStore((s) => s.sound);
  const setSoundConfig = useStore((s) => s.setSoundConfig);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'simulator', label: 'Parking Simulator', icon: <Car className="w-4 h-4" />, badge: '3D TPP & BACK CAM' },
    { id: 'perceptron-lab', label: 'Perceptron Lab & Logic', icon: <Cpu className="w-4 h-4" />, badge: 'INTERACTIVE' },
    { id: 'documentation', label: 'Verification & Docs', icon: <BookOpen className="w-4 h-4" />, badge: '10 TESTS' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] text-slate-900 dark:text-slate-100 flex flex-col bg-grid-pattern selection:bg-sky-500/20 dark:selection:bg-cyan-500/30 selection:text-sky-950 dark:selection:text-cyan-200 transition-colors duration-200">
      {/* Top Application Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#080B11]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setActivePage('simulator')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 p-0.5 shadow-md transition group-hover:scale-105">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Car className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition">
                    Smart Parking Assistant
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-cyan-950 border border-sky-300 dark:border-cyan-500/40 font-mono text-sky-800 dark:text-cyan-300 font-bold">
                    PERCEPTRON OR
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide hidden sm:block">
                  Automotive Obstacle Detection • Single-Neuron Binary Classifier
                </p>
              </div>
            </div>

            {/* Quick Live Status Badges & Controls */}
            <div className="flex items-center gap-2.5">
              {/* Perceptron Quick State */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">PERCEPTRON:</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    perceptron.y === 1 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      perceptron.y === 1 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  ></span>
                  {perceptron.y === 1 ? 'WARNING (Y=1)' : 'STANDBY (Y=0)'}
                </span>
              </div>

              {/* Theme Toggle Button (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition shadow-sm"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Master Audio Mute Toggle */}
              <button
                onClick={() => setSoundConfig({ muted: !sound.muted })}
                className={`p-2 rounded-xl border transition shadow-sm ${
                  sound.muted
                    ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    : 'bg-sky-50 dark:bg-cyan-950/70 border-sky-300 dark:border-cyan-500/40 text-sky-700 dark:text-cyan-300 hover:bg-sky-100 dark:hover:bg-cyan-900/60'
                }`}
                title={sound.muted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Mute Audio"
              >
                {sound.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-200 dark:border-slate-800/40 text-xs font-mono">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-3 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
                  activePage === item.id
                    ? 'bg-sky-500 text-white dark:bg-cyan-500/20 dark:text-cyan-300 font-bold shadow-sm border border-sky-400 dark:border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    activePage === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-cyan-950 text-slate-700 dark:text-cyan-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activePage === 'simulator' && <Simulator />}
        {activePage === 'perceptron-lab' && <PerceptronLab />}
        {activePage === 'sensor-lab' && <SensorLab />}
        {activePage === 'logic-explorer' && <LogicExplorer />}
        {activePage === 'mathematics' && <Mathematics />}
        {activePage === 'testing' && <Testing />}
        {activePage === 'documentation' && <Documentation />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-500 font-mono transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-cyan-400"></span>
            <span>Smart Parking Assistant • Single-Neuron Perceptron Simulator (OR Logic)</span>
          </div>
          <div>
            React 18 • Three.js (TPP & Back Camera) • TypeScript • Web Audio API • Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
};
