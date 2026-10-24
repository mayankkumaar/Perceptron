import React from 'react';
import { useStore } from '../../store/useStore';
import { getDecisionBoundaryPoints } from '../../perceptron/model';

export const DecisionBoundaryPlot: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const sensors = useStore((s) => s.sensors);

  const activeX1 = perceptron.manualOverride ? perceptron.manualX1 : sensors.x1;
  const activeX2 = perceptron.manualOverride ? perceptron.manualX2 : sensors.x2;

  const w1 = perceptron.w1;
  const w2 = perceptron.w2;
  const bias = perceptron.bias;

  // Coordinate mapping for SVG (Width: 360, Height: 360)
  // X range: -0.3 to 1.3 (span 1.6)
  // Y range: -0.3 to 1.3 (span 1.6, inverted Y for SVG)
  const mapX = (x: number) => 40 + ((x - (-0.3)) / 1.6) * 280;
  const mapY = (y: number) => 320 - ((y - (-0.3)) / 1.6) * 280;

  // 4 truth table data points
  const points = [
    { x1: 0, x2: 0, y: 0, label: '(0, 0) Safe' },
    { x1: 0, x2: 1, y: 1, label: '(0, 1) Warning' },
    { x1: 1, x2: 0, y: 1, label: '(1, 0) Warning' },
    { x1: 1, x2: 1, y: 1, label: '(1, 1) Warning' },
  ];

  // Decision line coordinates
  const boundary = getDecisionBoundaryPoints(w1, w2, bias, -0.3, 1.3);
  const xLine1 = mapX(boundary[0].x1);
  const yLine1 = mapY(boundary[0].x2);
  const xLine2 = mapX(boundary[1].x1);
  const yLine2 = mapY(boundary[1].x2);

  return (
    <div className="cockpit-panel rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">2D Decision Boundary Space</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Linear Separator: <span className="font-mono text-sky-700 dark:text-cyan-300 font-bold">{w1}·x₁ + {w2}·x₂ {bias >= 0 ? `+ ${bias}` : `- ${Math.abs(bias)}`} = 0</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center py-2">
        <svg width="360" height="360" className="bg-slate-950 rounded-xl border border-slate-800 shadow-md">
          {/* Grid lines */}
          <line x1={mapX(-0.3)} y1={mapY(0)} x2={mapX(1.3)} y2={mapY(0)} stroke="#334155" strokeWidth="1.5" />
          <line x1={mapX(0)} y1={mapY(-0.3)} x2={mapX(0)} y2={mapY(1.3)} stroke="#334155" strokeWidth="1.5" />

          <line x1={mapX(-0.3)} y1={mapY(1)} x2={mapX(1.3)} y2={mapY(1)} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={mapX(1)} y1={mapY(-0.3)} x2={mapX(1)} y2={mapY(1.3)} stroke="#1E293B" strokeDasharray="3 3" />

          {/* Axis Labels */}
          <text x={mapX(1.25)} y={mapY(0) + 16} fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
            X₁
          </text>
          <text x={mapX(0) - 18} y={mapY(1.25)} fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
            X₂
          </text>
          <text x={mapX(0) - 14} y={mapY(0) + 14} fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">
            0
          </text>
          <text x={mapX(1) - 6} y={mapY(0) + 14} fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">
            1
          </text>
          <text x={mapX(0) - 14} y={mapY(1) + 4} fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">
            1
          </text>

          {/* Decision Boundary Line */}
          <line
            x1={xLine1}
            y1={yLine1}
            x2={xLine2}
            y2={yLine2}
            stroke="#00F0FF"
            strokeWidth="3.5"
            strokeDasharray="6 3"
          />

          {/* 4 Data Points */}
          {points.map((pt, i) => {
            const cx = mapX(pt.x1);
            const cy = mapY(pt.x2);
            const isLive = activeX1 === pt.x1 && activeX2 === pt.x2;

            return (
              <g key={i}>
                {isLive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="18"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}
                {pt.y === 0 ? (
                  // Safe class circle
                  <circle
                    cx={cx}
                    cy={cy}
                    r="9"
                    fill="#10B981"
                    stroke="#047857"
                    strokeWidth="2"
                  />
                ) : (
                  // Warning class diamond
                  <rect
                    x={cx - 8}
                    y={cy - 8}
                    width="16"
                    height="16"
                    fill="#EF4444"
                    stroke="#B91C1C"
                    strokeWidth="2"
                    transform={`rotate(45 ${cx} ${cy})`}
                  />
                )}
                <text
                  x={cx + 14}
                  y={cy - 10}
                  fill={isLive ? '#00F0FF' : '#94A3B8'}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight={isLive ? 'bold' : 'normal'}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Class 0 (Safe)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-500 rotate-45 inline-block"></span>
          <span>Class 1 (Warning)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block"></span>
          <span>Hyperplane</span>
        </div>
      </div>
    </div>
  );
};
