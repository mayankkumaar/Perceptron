import React from 'react';
import { useStore } from '../store/useStore';
import { DecisionBoundaryPlot } from '../components/Charts/DecisionBoundaryPlot';
import { computePerceptron } from '../perceptron/model';
import { Sigma, FunctionSquare, Compass, CheckCircle, ArrowRight, Zap, BookOpen } from 'lucide-react';

export const Mathematics: React.FC = () => {
  const perceptron = useStore((s) => s.perceptron);
  const sensors = useStore((s) => s.sensors);
  const setPerceptronParams = useStore((s) => s.setPerceptronParams);

  const activeX1 = perceptron.manualOverride ? perceptron.manualX1 : sensors.x1;
  const activeX2 = perceptron.manualOverride ? perceptron.manualX2 : sensors.x2;

  const w1 = perceptron.w1;
  const w2 = perceptron.w2;
  const bias = perceptron.bias;

  const calc = computePerceptron(activeX1, activeX2, w1, w2, bias);

  // Slope and intercept for line: x2 = (-w1/w2)*x1 - (b/w2)
  const slope = w2 !== 0 ? (-w1 / w2).toFixed(2) : 'Undefined (Vertical)';
  const intercept = w2 !== 0 ? (-bias / w2).toFixed(2) : 'N/A';

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sigma className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-extrabold text-white">Mathematical Model & Hyperplane Formulation</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed derivation of the artificial neuron dot product, affine transformation, and linear decision boundary geometry.
        </p>
      </div>

      {/* The 6 Core Mathematical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-cyan-400">01 • INPUT FEATURES</span>
          <h4 className="text-sm font-bold text-slate-100">Vector x ∈ &#123;0, 1&#125;²</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Binary sensor representations from ultrasonic transducers. x₁ denotes general zone clearance, while x₂ indicates critical proximity zone violation.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-cyan-400">02 • SYNAPTIC WEIGHTS</span>
          <h4 className="text-sm font-bold text-slate-100">Weight Vector w = [w₁, w₂]</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quantifies the relative importance of each sensor signal. Equal weights w₁ = 1.0, w₂ = 1.0 reflect symmetric safety importance for both ultrasonic channels.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-purple-400">03 • THRESHOLD BIAS</span>
          <h4 className="text-sm font-bold text-slate-100">Scalar Bias b ∈ ℝ</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Shifts the decision hyperplane away from the origin without requiring zero-input activation. For an OR gate, setting b = -0.5 places (0,0) in the negative half-space.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-amber-400">04 • AFFINE SUMMATION</span>
          <h4 className="text-sm font-bold text-slate-100">Net Input z = wᵀx + b</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Computes the inner product of weights and inputs plus bias: z = w₁x₁ + w₂x₂ + b. This scalar represents the signed distance to the decision hyperplane.
          </p>
        </div>

        {/* Pillar 5 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-cyan-400">05 • STEP ACTIVATION</span>
          <h4 className="text-sm font-bold text-slate-100">Heaviside H(z)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nonlinear discontinuous step function: Y = 1 if z ≥ 0, and Y = 0 if z &lt; 0. Converts continuous affine sum into a sharp binary decision.
          </p>
        </div>

        {/* Pillar 6 */}
        <div className="cockpit-panel rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-emerald-400">06 • BINARY PREDICTION</span>
          <h4 className="text-sm font-bold text-slate-100">Driver Alert Y ∈ &#123;0, 1&#125;</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Final actionable actuator command. Y = 1 triggers multi-frequency audio beepers and instrument cluster hazard LEDs.
          </p>
        </div>
      </div>

      {/* Live Interactive Calculation Panel */}
      <div className="cockpit-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Live Algebraic Substitution Example
          </h3>
          <span className="text-xs font-mono text-cyan-300">
            x₁ = {activeX1}, x₂ = {activeX2}, w₁ = {w1}, w₂ = {w2}, b = {bias}
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 font-mono text-xs md:text-sm space-y-3">
          <div className="text-slate-400">
            <strong>1. General Equation:</strong>
            <div className="text-cyan-300 text-base font-bold mt-1">z = (w₁ · x₁) + (w₂ · x₂) + b</div>
          </div>

          <div className="text-slate-400">
            <strong>2. Parameter Value Substitution:</strong>
            <div className="text-slate-200 text-sm font-semibold mt-1">
              z = ({w1} × {activeX1}) + ({w2} × {activeX2}) {bias >= 0 ? `+ ${bias}` : `- ${Math.abs(bias)}`}
            </div>
          </div>

          <div className="text-slate-400">
            <strong>3. Term-by-Term Evaluation:</strong>
            <div className="text-slate-200 text-sm font-semibold mt-1">
              z = {calc.w1x1} + {calc.w2x2} {bias >= 0 ? `+ ${bias}` : `- ${Math.abs(bias)}`} ={' '}
              <strong className={calc.z >= 0 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                {calc.z}
              </strong>
            </div>
          </div>

          <div className="text-slate-400 border-t border-slate-800 pt-3">
            <strong>4. Step Threshold Evaluation:</strong>
            <div className="text-slate-200 text-sm font-semibold mt-1 flex items-center gap-2">
              <span>Since z = {calc.z} {calc.z >= 0 ? '≥ 0' : '< 0'}:</span>
              <span
                className={`px-3 py-0.5 rounded font-bold text-sm ${
                  calc.y === 1
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                Y = {calc.y} ({calc.y === 1 ? 'WARNING ON' : 'STANDBY'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Boundary Derivation & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 cockpit-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Decision Hyperplane Geometry
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The decision boundary represents the set of all input coordinates where the net input is exactly zero ($z = 0$).
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 mb-4">
              <div className="text-slate-400">Setting net input $z = 0$:</div>
              <div className="text-cyan-300 font-bold">w₁·x₁ + w₂·x₂ + b = 0</div>
              <div className="text-slate-400">Rearranging for $x_2$ in slope-intercept form ($y = mx + c$):</div>
              <div className="text-slate-200 font-bold">x₂ = (-w₁ / w₂) · x₁ - (b / w₂)</div>
              <div className="border-t border-slate-800 pt-2 text-slate-300">
                <div>Slope (m): <strong className="text-cyan-300">{slope}</strong></div>
                <div>Y-Intercept (c): <strong className="text-cyan-300">{intercept}</strong></div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              For initial values w₁ = 1, w₂ = 1, b = -0.5, the boundary is x₂ = -x₁ + 0.5.
              This line neatly passes between (0,0) (where z = -0.5 &lt; 0) and the three active states (0,1), (1,0), (1,1) (where z ≥ 0.5 ≥ 0).
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <DecisionBoundaryPlot />
        </div>
      </div>
    </div>
  );
};
