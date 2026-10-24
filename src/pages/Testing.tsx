import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { computePerceptron, OR_TRUTH_TABLE } from '../perceptron/model';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Award,
  Activity,
  Car,
  Clock,
  Gauge,
} from 'lucide-react';

export const Testing: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const metrics = useStore((s) => s.metrics);
  const resetMetrics = useStore((s) => s.resetMetrics);

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<
    {
      id: number;
      x1: number;
      x2: number;
      expected: number;
      actual: number;
      z: number;
      passed: boolean;
      scenario: string;
    }[]
  >(() =>
    OR_TRUTH_TABLE.map((row, idx) => {
      const calc = computePerceptron(row.x1, row.x2, perceptron.w1, perceptron.w2, perceptron.bias);
      return {
        id: idx + 1,
        x1: row.x1,
        x2: row.x2,
        expected: row.expected,
        actual: calc.y,
        z: calc.z,
        passed: calc.y === row.expected,
        scenario: row.scenario,
      };
    })
  );

  const handleRunAllTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = OR_TRUTH_TABLE.map((row, idx) => {
        const calc = computePerceptron(row.x1, row.x2, perceptron.w1, perceptron.w2, perceptron.bias);
        return {
          id: idx + 1,
          x1: row.x1,
          x2: row.x2,
          expected: row.expected,
          actual: calc.y,
          z: calc.z,
          passed: calc.y === row.expected,
          scenario: row.scenario,
        };
      });
      setTestResults(results);
      setIsRunningTests(false);
    }, 450);
  };

  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const accuracy = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-extrabold text-white">Automated Verification & Telemetry Results</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated test harness verifying the single-neuron perceptron implementation against all 4 OR gate test cases, alongside empirical vehicle driving metrics.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={isRunningTests}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-glow-cyan transition active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          {isRunningTests ? 'Running Automated Suite...' : 'Run Automated Test Suite'}
        </button>
      </div>

      {/* KPI Cards: Math Tests vs Game Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Math Accuracy */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400">LOGIC TRUTH ACCURACY</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{accuracy}%</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {passedTests} / {totalTests} Test Cases Passed
          </span>
        </div>

        {/* Successful Parking Attempts */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400">PARKING SUCCESS RATE</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              {metrics.totalAttempts > 0
                ? Math.round((metrics.successfulAttempts / metrics.totalAttempts) * 100)
                : 0}
              %
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {metrics.successfulAttempts} of {metrics.totalAttempts} attempts
          </span>
        </div>

        {/* Collisions */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400">RECORDED COLLISIONS</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-red-400">{metrics.collisions}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Obstacle impacts logged</span>
        </div>

        {/* Average Time */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400">AVG PARKING DURATION</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-amber-300">
              {metrics.averageParkingTime}s
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Time per maneuver</span>
        </div>
      </div>

      {/* Formal Test Case Suite Table */}
      <div className="cockpit-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Perceptron Mathematical Model Unit Tests
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Current Weights: w₁={perceptron.w1}, w₂={perceptron.w2}, b={perceptron.bias}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3 px-3">Test ID</th>
                <th className="py-3 px-3">Test Scenario</th>
                <th className="py-3 px-3">Input X₁</th>
                <th className="py-3 px-3">Input X₂</th>
                <th className="py-3 px-3">Weighted Sum (z)</th>
                <th className="py-3 px-3">Expected Y</th>
                <th className="py-3 px-3">Actual Y</th>
                <th className="py-3 px-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((t) => (
                <tr key={t.id} className="border-b border-slate-800/60 hover:bg-slate-900/30">
                  <td className="py-3.5 px-3 font-bold text-cyan-300">Test {t.id}</td>
                  <td className="py-3.5 px-3 text-slate-300">{t.scenario}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{t.x1}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{t.x2}</td>
                  <td className="py-3.5 px-3 text-slate-400">z = {t.z}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-300">{t.expected}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{t.actual}</td>
                  <td className="py-3.5 px-3">
                    {t.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clarification Alert Banner */}
        <div className="mt-5 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Important Scientific Distinction:</strong> Do not confuse the four mathematical truth-table unit tests with real-world empirical parking safety accuracy. The 100% test pass rate proves the mathematical correctness of the binary classification algorithm ($z \ge 0 \implies Y = 1$), whereas parking game success depends on driver steering, braking responsiveness, and vehicle kinematics.
          </div>
        </div>
      </div>

      {/* Game Performance Telemetry Reset */}
      <div className="cockpit-panel rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Reset Gameplay Session Metrics</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear logged parking attempts, collisions, and duration stopwatch counters.
          </p>
        </div>
        <button
          onClick={resetMetrics}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Reset Metrics
        </button>
      </div>
    </div>
  );
};
