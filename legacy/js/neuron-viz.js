/**
 * SVG Animated Perceptron Visualizer
 * Renders an interactive, scientifically accurate vector diagram of the artificial neuron.
 * Orchestrates signal flow, summation, activation thresholding, error detection,
 * and weight delta updates.
 */

import { Perceptron } from './perceptron.js';

export class NeuronVisualizer {
  /**
   * @param {SVGElement} svgElement Container SVG DOM element
   * @param {HTMLElement} equationElement Container for live mathematical step-by-step breakdown
   */
  constructor(svgElement, equationElement) {
    this.svg = svgElement;
    this.equationEl = equationElement;
    this.animationTimer = null;
    this.animationFrameId = null;
    this.animationGeneration = 0;
    this.reducedMotion = false;

    // Fixed internal coordinate system (viewBox: 0 0 920 480)
    this.coords = {
      x1: { x: 130, y: 110, r: 36 },
      x2: { x: 130, y: 330, r: 36 },
      bias: { x: 280, y: 420, r: 28 },
      neuron: { x: 500, y: 220, r: 76 },
      output: { x: 800, y: 220, r: 42 }
    };

    this.initSvgStructure();
  }

  /**
   * Initializes permanent SVG nodes, defs, gradients, and groups.
   */
  initSvgStructure() {
    this.svg.setAttribute('viewBox', '0 0 920 480');
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    this.svg.innerHTML = `
      <defs>
        <!-- Gradients -->
        <linearGradient id="neuronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141f36" />
          <stop offset="100%" stop-color="#0b1324" />
        </linearGradient>

        <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>

        <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>

        <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#be123c" />
        </linearGradient>

        <!-- Glow Filters -->
        <filter id="glowCyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <!-- Arrowhead Marker -->
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
        </marker>
        <marker id="arrowMuted" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
        </marker>
      </defs>

      <!-- Background connection tracks -->
      <g id="connections-group">
        <!-- w1 path: x1 -> neuron -->
        <path id="path-w1" class="conn-path" d="M 166 110 C 300 110, 360 190, 424 208" fill="none" stroke="#334155" stroke-width="3" />
        <!-- w2 path: x2 -> neuron -->
        <path id="path-w2" class="conn-path" d="M 166 330 C 300 330, 360 250, 424 232" fill="none" stroke="#334155" stroke-width="3" />
        <!-- bias path: bias -> neuron -->
        <path id="path-b" class="conn-path" d="M 308 420 C 380 420, 440 340, 465 288" fill="none" stroke="#334155" stroke-width="2.5" stroke-dasharray="4,4" />
        <!-- output path: neuron -> output node -->
        <path id="path-out" class="conn-path" d="M 576 220 L 758 220" fill="none" stroke="#334155" stroke-width="3.5" marker-end="url(#arrowMuted)" />
      </g>

      <!-- Animated Traveling Signal Pulses -->
      <g id="signals-group">
        <circle id="signal-w1" r="6" fill="#38bdf8" opacity="0" filter="url(#glowCyan)" />
        <circle id="signal-w2" r="6" fill="#38bdf8" opacity="0" filter="url(#glowCyan)" />
        <circle id="signal-b"  r="5" fill="#f59e0b" opacity="0" />
        <circle id="signal-out" r="7" fill="#38bdf8" opacity="0" filter="url(#glowCyan)" />
      </g>

      <!-- Weight & Bias Badges on Connections -->
      <g id="weights-group">
        <!-- Weight 1 Badge -->
        <g id="badge-w1" transform="translate(260, 105)">
          <rect x="-50" y="-14" width="100" height="28" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text id="text-w1" x="0" y="5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" fill="#e2e8f0">w₁ = 0.00</text>
          <text id="delta-w1" x="0" y="-18" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#38bdf8" opacity="0"></text>
          <text id="prod-w1" x="0" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#94a3b8">x₁·w₁ = 0.00</text>
        </g>

        <!-- Weight 2 Badge -->
        <g id="badge-w2" transform="translate(260, 335)">
          <rect x="-50" y="-14" width="100" height="28" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text id="text-w2" x="0" y="5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" fill="#e2e8f0">w₂ = 0.00</text>
          <text id="delta-w2" x="0" y="-18" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#38bdf8" opacity="0"></text>
          <text id="prod-w2" x="0" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#94a3b8">x₂·w₂ = 0.00</text>
        </g>

        <!-- Bias Badge -->
        <g id="badge-b" transform="translate(370, 395)">
          <rect x="-46" y="-13" width="92" height="26" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
          <text id="text-b" x="0" y="4.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" fill="#fde68a">b = 0.00</text>
          <text id="delta-b" x="0" y="-17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#f59e0b" opacity="0"></text>
        </g>
      </g>

      <!-- Input Node: x1 -->
      <g id="node-x1" transform="translate(130, 110)">
        <circle id="circle-x1" r="36" fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="2.5" />
        <text x="0" y="-8" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">INPUT 1</text>
        <text id="val-x1" x="0" y="16" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="#f8fafc">x₁ = 0</text>
      </g>

      <!-- Input Node: x2 -->
      <g id="node-x2" transform="translate(130, 330)">
        <circle id="circle-x2" r="36" fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="2.5" />
        <text x="0" y="-8" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#94a3b8" letter-spacing="1">INPUT 2</text>
        <text id="val-x2" x="0" y="16" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="#f8fafc">x₂ = 0</text>
      </g>

      <!-- Bias Input Node: +1 -->
      <g id="node-bias" transform="translate(280, 420)">
        <circle id="circle-bias" r="24" fill="url(#nodeGrad)" stroke="#f59e0b" stroke-width="2" />
        <text x="0" y="-4" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="600" fill="#fbbf24">BIAS</text>
        <text x="0" y="11" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#fde68a">+1</text>
      </g>

      <!-- Central Neuron Body -->
      <g id="neuron-body" transform="translate(500, 220)">
        <!-- Outer Shell -->
        <circle id="neuron-outer" r="76" fill="url(#neuronGrad)" stroke="#475569" stroke-width="3" />

        <!-- Internal Dividing Line between Summation and Activation -->
        <line x1="0" y1="-74" x2="0" y2="74" stroke="#334155" stroke-width="2" stroke-dasharray="3,3" />

        <!-- Left Compartment: Summation -->
        <g id="summation-section" transform="translate(-36, 0)">
          <text x="0" y="-34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94a3b8" letter-spacing="0.5">SUM</text>
          <text x="0" y="-6" text-anchor="middle" font-family="Inter, sans-serif" font-size="26" font-weight="300" fill="#38bdf8">∑</text>
          <text id="text-z-val" x="0" y="24" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#f8fafc">z = 0.00</text>
          <text x="0" y="44" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#64748b">∑wᵢxᵢ+b</text>
        </g>

        <!-- Right Compartment: Activation Function -->
        <g id="activation-section" transform="translate(36, 0)">
          <text x="0" y="-34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94a3b8" letter-spacing="0.5">ACTIVATION</text>
          <!-- Step Function Icon Glyph -->
          <path d="M -18 8 L -2 8 L -2 -14 L 14 -14" fill="none" stroke="#38bdf8" stroke-width="2.5" />
          <line x1="-20" y1="8" x2="18" y2="8" stroke="#334155" stroke-width="1" />
          <text x="0" y="-18" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Θ(z)</text>
          <text id="text-thresh" x="0" y="24" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="600" fill="#e2e8f0">z ≥ 0 → 1</text>
          <text x="0" y="44" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#64748b">z &lt; 0 → 0</text>
        </g>

        <!-- Dynamic Halo Ring for Activation/Error -->
        <circle id="neuron-pulse-ring" r="80" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0" />
      </g>

      <!-- Output Node: Predicted ŷ and Target y -->
      <g id="node-output" transform="translate(800, 220)">
        <!-- Circle -->
        <circle id="circle-out" r="42" fill="url(#nodeGrad)" stroke="#475569" stroke-width="3" />
        <text x="0" y="-12" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94a3b8" letter-spacing="1">PREDICTION</text>
        <text id="val-yhat" x="0" y="14" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700" fill="#f8fafc">ŷ = 0</text>
        <text id="eval-status" x="0" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#64748b">IDLE</text>

        <!-- Adjacent Target Badge -->
        <g id="badge-target" transform="translate(0, 70)">
          <rect x="-60" y="-12" width="120" height="24" rx="5" fill="#0f172a" stroke="#334155" stroke-width="1" />
          <text id="text-target" x="0" y="4" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="#94a3b8">Target: y = 0</text>
        </g>

        <!-- Adjacent Error Badge -->
        <g id="badge-error" transform="translate(0, 102)">
          <rect id="rect-error" x="-60" y="-12" width="120" height="24" rx="5" fill="#0f172a" stroke="#334155" stroke-width="1" />
          <text id="text-error" x="0" y="4" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#64748b">Error: e = 0</text>
        </g>
      </g>
    `;

    // Cache element references for zero-overhead animation updates
    this.el = {
      valX1: this.svg.querySelector('#val-x1'),
      valX2: this.svg.querySelector('#val-x2'),
      circleX1: this.svg.querySelector('#circle-x1'),
      circleX2: this.svg.querySelector('#circle-x2'),
      circleBias: this.svg.querySelector('#circle-bias'),
      textW1: this.svg.querySelector('#text-w1'),
      textW2: this.svg.querySelector('#text-w2'),
      textB: this.svg.querySelector('#text-b'),
      deltaW1: this.svg.querySelector('#delta-w1'),
      deltaW2: this.svg.querySelector('#delta-w2'),
      deltaB: this.svg.querySelector('#delta-b'),
      prodW1: this.svg.querySelector('#prod-w1'),
      prodW2: this.svg.querySelector('#prod-w2'),
      pathW1: this.svg.querySelector('#path-w1'),
      pathW2: this.svg.querySelector('#path-w2'),
      pathB: this.svg.querySelector('#path-b'),
      pathOut: this.svg.querySelector('#path-out'),
      signalW1: this.svg.querySelector('#signal-w1'),
      signalW2: this.svg.querySelector('#signal-w2'),
      signalB: this.svg.querySelector('#signal-b'),
      signalOut: this.svg.querySelector('#signal-out'),
      neuronOuter: this.svg.querySelector('#neuron-outer'),
      neuronPulseRing: this.svg.querySelector('#neuron-pulse-ring'),
      textZVal: this.svg.querySelector('#text-z-val'),
      circleOut: this.svg.querySelector('#circle-out'),
      valYHat: this.svg.querySelector('#val-yhat'),
      evalStatus: this.svg.querySelector('#eval-status'),
      textTarget: this.svg.querySelector('#text-target'),
      rectError: this.svg.querySelector('#rect-error'),
      textError: this.svg.querySelector('#text-error')
    };

    // Calculate path lengths for smooth interpolation
    this.pathLenW1 = this.el.pathW1.getTotalLength();
    this.pathLenW2 = this.el.pathW2.getTotalLength();
    this.pathLenB = this.el.pathB.getTotalLength();
    this.pathLenOut = this.el.pathOut.getTotalLength();
  }

  setSvgText(element, value, maxWidth) {
    element.textContent = value;
    element.removeAttribute('textLength');
    element.removeAttribute('lengthAdjust');

    if (typeof element.getComputedTextLength !== 'function') return;
    const measuredWidth = element.getComputedTextLength();
    if (measuredWidth > maxWidth) {
      element.setAttribute('textLength', String(maxWidth));
      element.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
  }

  /**
   * Resets visual indicators and signal pulses to neutral idle state.
   */
  resetVisuals() {
    this.cancelAnimation();
    this.el.signalW1.setAttribute('opacity', '0');
    this.el.signalW2.setAttribute('opacity', '0');
    this.el.signalB.setAttribute('opacity', '0');
    this.el.signalOut.setAttribute('opacity', '0');

    this.el.circleX1.setAttribute('stroke', '#38bdf8');
    this.el.circleX2.setAttribute('stroke', '#38bdf8');
    this.el.neuronOuter.setAttribute('stroke', '#475569');
    this.el.neuronPulseRing.setAttribute('opacity', '0');

    this.el.circleOut.setAttribute('stroke', '#475569');
    this.el.circleOut.setAttribute('fill', 'url(#nodeGrad)');
    this.el.evalStatus.textContent = 'IDLE';
    this.el.evalStatus.setAttribute('fill', '#64748b');

    this.el.deltaW1.setAttribute('opacity', '0');
    this.el.deltaW2.setAttribute('opacity', '0');
    this.el.deltaB.setAttribute('opacity', '0');
    this.el.rectError.setAttribute('stroke', '#334155');
    this.el.textError.setAttribute('fill', '#64748b');
  }

  /**
   * Cancels any pending animation timeout or requestAnimationFrame.
   */
  cancelAnimation() {
    this.animationGeneration++;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Static render of the perceptron with current weights and optional sample inputs.
   * @param {Object} state
   */
  renderState(state) {
    const { w1, w2, b, x1 = 0, x2 = 0, target = 0 } = state;
    const { z, yHat, w1x1, w2x2 } = state.predictionData || {
      w1x1: Perceptron.round(w1 * x1, 4),
      w2x2: Perceptron.round(w2 * x2, 4),
      z: Perceptron.round(w1 * x1 + w2 * x2 + b, 4),
      yHat: Perceptron.step(w1 * x1 + w2 * x2 + b)
    };

    // Update weight labels
    this.setSvgText(this.el.textW1, `w₁ = ${Perceptron.formatNumber(w1)}`, 94);
    this.setSvgText(this.el.textW2, `w₂ = ${Perceptron.formatNumber(w2)}`, 94);
    this.setSvgText(this.el.textB, `b = ${Perceptron.formatNumber(b)}`, 86);

    // Update product annotations
    this.setSvgText(this.el.prodW1, `x₁·w₁ = ${Perceptron.formatNumber(w1x1)}`, 94);
    this.setSvgText(this.el.prodW2, `x₂·w₂ = ${Perceptron.formatNumber(w2x2)}`, 94);

    // Update input node text
    this.el.valX1.textContent = `x₁ = ${x1}`;
    this.el.valX2.textContent = `x₂ = ${x2}`;

    // Style inputs based on 0 or 1
    this.el.circleX1.setAttribute('fill', x1 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');
    this.el.circleX2.setAttribute('fill', x2 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');

    // Update summation and threshold
    this.el.textZVal.textContent = `z = ${Perceptron.formatNumber(z)}`;

    // Update prediction and target
    this.el.valYHat.textContent = `ŷ = ${yHat}`;
    this.setSvgText(this.el.textTarget, `Target: y = ${target}`, 112);

    const isMatch = (yHat === target);
    const error = target - yHat;
    this.setSvgText(this.el.textError, `Error: e = ${error > 0 ? '+' : ''}${error}`, 112);

    if (state.hasEvaluated) {
      if (isMatch) {
        this.el.circleOut.setAttribute('stroke', '#10b981');
        this.el.circleOut.setAttribute('fill', 'url(#successGrad)');
        this.el.evalStatus.textContent = 'CORRECT';
        this.el.evalStatus.setAttribute('fill', '#10b981');
        this.el.rectError.setAttribute('stroke', '#10b981');
        this.el.textError.setAttribute('fill', '#10b981');
      } else {
        this.el.circleOut.setAttribute('stroke', '#f43f5e');
        this.el.circleOut.setAttribute('fill', 'url(#errorGrad)');
        this.el.evalStatus.textContent = 'INCORRECT';
        this.el.evalStatus.setAttribute('fill', '#f43f5e');
        this.el.rectError.setAttribute('stroke', '#f43f5e');
        this.el.textError.setAttribute('fill', '#f43f5e');
      }
    }

    this.renderEquationBar({
      x1, x2, target,
      w1, w2, b,
      w1x1, w2x2, z,
      yHat, error,
      deltaW1: 0, deltaW2: 0, deltaB: 0,
      hasUpdated: false,
      learningRate: state.learningRate ?? 0.1
    });
  }

  /**
   * Choreographs the multi-phase animated training step using the exact snapshot.
   *
   * Phase 1 (0 to 35%): Signal packets travel along input connections.
   * Phase 2 (35 to 70%): Neuron receives signals, calculates z, applies step activation, emits prediction.
   * Phase 3 (70 to 100%): Comparison with target. If error != 0, deltas flash and parameters update.
   *
   * @param {Object} snapshot From perceptron.trainSample()
   * @param {number} totalDuration Milliseconds for the entire sequence
   * @param {Function} [onComplete] Callback when animation finishes
   */
  animateStep(snapshot, totalDuration = 1200, onComplete = null) {
    this.cancelAnimation();

    if (this.reducedMotion || totalDuration <= 100) {
      // Instant execution for reduced motion or fast playback
      this.applyFinalSnapshotState(snapshot);
      if (onComplete) onComplete();
      return;
    }

    const { inputs, target, oldParams, weightedProducts, z, prediction, error, delta, newParams, hasUpdated, learningRate } = snapshot;

    // Reset initial visuals with old parameters
    this.resetVisuals();
    this.setSvgText(this.el.textW1, `w₁ = ${Perceptron.formatNumber(oldParams.w1)}`, 94);
    this.setSvgText(this.el.textW2, `w₂ = ${Perceptron.formatNumber(oldParams.w2)}`, 94);
    this.setSvgText(this.el.textB, `b = ${Perceptron.formatNumber(oldParams.b)}`, 86);

    this.el.valX1.textContent = `x₁ = ${inputs.x1}`;
    this.el.valX2.textContent = `x₂ = ${inputs.x2}`;
    this.el.circleX1.setAttribute('fill', inputs.x1 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');
    this.el.circleX2.setAttribute('fill', inputs.x2 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');

    this.setSvgText(this.el.prodW1, `x₁·w₁ = ${Perceptron.formatNumber(weightedProducts.w1x1)}`, 94);
    this.setSvgText(this.el.prodW2, `x₂·w₂ = ${Perceptron.formatNumber(weightedProducts.w2x2)}`, 94);

    this.setSvgText(this.el.textTarget, `Target: y = ${target}`, 112);
    this.el.valYHat.textContent = `ŷ = ?`;
    this.el.evalStatus.textContent = 'EVALUATING';
    this.el.evalStatus.setAttribute('fill', '#38bdf8');

    // Timing splits
    const phase1Duration = Math.round(totalDuration * 0.35);
    const phase2Duration = Math.round(totalDuration * 0.35);
    const phase3Duration = Math.max(50, totalDuration - phase1Duration - phase2Duration);

    // Update Equation Bar - Phase 1
    this.renderEquationBar({
      x1: inputs.x1, x2: inputs.x2, target,
      w1: oldParams.w1, w2: oldParams.w2, b: oldParams.b,
      w1x1: weightedProducts.w1x1, w2x2: weightedProducts.w2x2,
      z, yHat: prediction, error,
      deltaW1: delta.w1, deltaW2: delta.w2, deltaB: delta.b,
      hasUpdated, learningRate,
      phase: 1
    });

    // Animate Phase 1: Signals travel to neuron
    this.animateSignalPackets(phase1Duration, () => {
      // Phase 2: Neuron summation & activation
      this.el.textZVal.textContent = `z = ${Perceptron.formatNumber(z)}`;
      this.el.neuronOuter.setAttribute('stroke', '#38bdf8');
      this.el.neuronPulseRing.setAttribute('stroke', '#38bdf8');
      this.el.neuronPulseRing.setAttribute('opacity', '0.8');

      // Update Equation Bar - Phase 2
      this.renderEquationBar({
        x1: inputs.x1, x2: inputs.x2, target,
        w1: oldParams.w1, w2: oldParams.w2, b: oldParams.b,
        w1x1: weightedProducts.w1x1, w2x2: weightedProducts.w2x2,
        z, yHat: prediction, error,
        deltaW1: delta.w1, deltaW2: delta.w2, deltaB: delta.b,
        hasUpdated, learningRate,
        phase: 2
      });

      // Animate signal from neuron to output
      this.animateOutputSignal(phase2Duration, () => {
        // Phase 3: Compare with target & parameter update
        this.el.valYHat.textContent = `ŷ = ${prediction}`;
        this.setSvgText(this.el.textError, `Error: e = ${error > 0 ? '+' : ''}${error}`, 112);

        if (error === 0) {
          // Correct prediction
          this.el.circleOut.setAttribute('stroke', '#10b981');
          this.el.circleOut.setAttribute('fill', 'url(#successGrad)');
          this.el.evalStatus.textContent = 'CORRECT';
          this.el.evalStatus.setAttribute('fill', '#10b981');
          this.el.rectError.setAttribute('stroke', '#10b981');
          this.el.textError.setAttribute('fill', '#10b981');
          this.el.neuronOuter.setAttribute('stroke', '#10b981');
        } else {
          // Incorrect prediction
          this.el.circleOut.setAttribute('stroke', '#f43f5e');
          this.el.circleOut.setAttribute('fill', 'url(#errorGrad)');
          this.el.evalStatus.textContent = 'INCORRECT';
          this.el.evalStatus.setAttribute('fill', '#f43f5e');
          this.el.rectError.setAttribute('stroke', '#f43f5e');
          this.el.textError.setAttribute('fill', '#f43f5e');
          this.el.neuronOuter.setAttribute('stroke', '#f43f5e');

          // Highlight weight delta updates
          this.showWeightDeltas(delta, newParams);
        }

        // Finalize weights and equation bar
        this.setSvgText(this.el.textW1, `w₁ = ${Perceptron.formatNumber(newParams.w1)}`, 94);
        this.setSvgText(this.el.textW2, `w₂ = ${Perceptron.formatNumber(newParams.w2)}`, 94);
        this.setSvgText(this.el.textB, `b = ${Perceptron.formatNumber(newParams.b)}`, 86);

        this.renderEquationBar({
          x1: inputs.x1, x2: inputs.x2, target,
          w1: newParams.w1, w2: newParams.w2, b: newParams.b,
          w1x1: weightedProducts.w1x1, w2x2: weightedProducts.w2x2,
          z, yHat: prediction, error,
          deltaW1: delta.w1, deltaW2: delta.w2, deltaB: delta.b,
          hasUpdated, learningRate,
          phase: 3
        });

        this.animationTimer = setTimeout(() => {
          if (onComplete) onComplete();
        }, phase3Duration);
      });
    });
  }

  /**
   * Applies final snapshot state immediately without animating.
   * @param {Object} snapshot
   */
  applyFinalSnapshotState(snapshot) {
    this.resetVisuals();
    const { inputs, target, weightedProducts, z, prediction, error, delta, newParams, hasUpdated, learningRate } = snapshot;

    this.el.valX1.textContent = `x₁ = ${inputs.x1}`;
    this.el.valX2.textContent = `x₂ = ${inputs.x2}`;
    this.el.circleX1.setAttribute('fill', inputs.x1 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');
    this.el.circleX2.setAttribute('fill', inputs.x2 === 1 ? 'url(#activeGrad)' : 'url(#nodeGrad)');

    this.setSvgText(this.el.prodW1, `x₁·w₁ = ${Perceptron.formatNumber(weightedProducts.w1x1)}`, 94);
    this.setSvgText(this.el.prodW2, `x₂·w₂ = ${Perceptron.formatNumber(weightedProducts.w2x2)}`, 94);

    this.setSvgText(this.el.textW1, `w₁ = ${Perceptron.formatNumber(newParams.w1)}`, 94);
    this.setSvgText(this.el.textW2, `w₂ = ${Perceptron.formatNumber(newParams.w2)}`, 94);
    this.setSvgText(this.el.textB, `b = ${Perceptron.formatNumber(newParams.b)}`, 86);

    this.el.textZVal.textContent = `z = ${Perceptron.formatNumber(z)}`;
    this.el.valYHat.textContent = `ŷ = ${prediction}`;
    this.setSvgText(this.el.textTarget, `Target: y = ${target}`, 112);
    this.setSvgText(this.el.textError, `Error: e = ${error > 0 ? '+' : ''}${error}`, 112);

    if (error === 0) {
      this.el.circleOut.setAttribute('stroke', '#10b981');
      this.el.circleOut.setAttribute('fill', 'url(#successGrad)');
      this.el.evalStatus.textContent = 'CORRECT';
      this.el.evalStatus.setAttribute('fill', '#10b981');
      this.el.rectError.setAttribute('stroke', '#10b981');
      this.el.textError.setAttribute('fill', '#10b981');
    } else {
      this.el.circleOut.setAttribute('stroke', '#f43f5e');
      this.el.circleOut.setAttribute('fill', 'url(#errorGrad)');
      this.el.evalStatus.textContent = 'INCORRECT';
      this.el.evalStatus.setAttribute('fill', '#f43f5e');
      this.el.rectError.setAttribute('stroke', '#f43f5e');
      this.el.textError.setAttribute('fill', '#f43f5e');
      this.showWeightDeltas(delta, newParams);
    }

    this.renderEquationBar({
      x1: inputs.x1, x2: inputs.x2, target,
      w1: newParams.w1, w2: newParams.w2, b: newParams.b,
      w1x1: weightedProducts.w1x1, w2x2: weightedProducts.w2x2,
      z, yHat: prediction, error,
      deltaW1: delta.w1, deltaW2: delta.w2, deltaB: delta.b,
      hasUpdated, learningRate,
      phase: 3
    });
  }

  /**
   * Animates signal packets along input paths using requestAnimationFrame.
   */
  animateSignalPackets(duration, onDone) {
    const startTime = performance.now();
    const animationGeneration = this.animationGeneration;

    this.el.signalW1.setAttribute('opacity', '1');
    this.el.signalW2.setAttribute('opacity', '1');
    this.el.signalB.setAttribute('opacity', '1');

    const tick = (now) => {
      if (animationGeneration !== this.animationGeneration) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const pW1 = this.el.pathW1.getPointAtLength(eased * this.pathLenW1);
      const pW2 = this.el.pathW2.getPointAtLength(eased * this.pathLenW2);
      const pB = this.el.pathB.getPointAtLength(eased * this.pathLenB);

      this.el.signalW1.setAttribute('cx', pW1.x);
      this.el.signalW1.setAttribute('cy', pW1.y);

      this.el.signalW2.setAttribute('cx', pW2.x);
      this.el.signalW2.setAttribute('cy', pW2.y);

      this.el.signalB.setAttribute('cx', pB.x);
      this.el.signalB.setAttribute('cy', pB.y);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.animationFrameId = null;
        this.el.signalW1.setAttribute('opacity', '0');
        this.el.signalW2.setAttribute('opacity', '0');
        this.el.signalB.setAttribute('opacity', '0');
        if (onDone) onDone();
      }
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Animates output signal packet from neuron center to output node.
   */
  animateOutputSignal(duration, onDone) {
    const startTime = performance.now();
    const animationGeneration = this.animationGeneration;
    this.el.signalOut.setAttribute('opacity', '1');

    const tick = (now) => {
      if (animationGeneration !== this.animationGeneration) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 2);

      const pt = this.el.pathOut.getPointAtLength(eased * this.pathLenOut);
      this.el.signalOut.setAttribute('cx', pt.x);
      this.el.signalOut.setAttribute('cy', pt.y);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.animationFrameId = null;
        this.el.signalOut.setAttribute('opacity', '0');
        if (onDone) onDone();
      }
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Displays the mathematical weight updates (Δw1, Δw2, Δb).
   */
  showWeightDeltas(delta, newParams) {
    if (delta.w1 !== 0) {
      this.setSvgText(this.el.deltaW1, `Δw₁ = ${delta.w1 > 0 ? '+' : ''}${delta.w1.toFixed(2)}`, 108);
      this.el.deltaW1.setAttribute('fill', delta.w1 > 0 ? '#10b981' : '#f43f5e');
      this.el.deltaW1.setAttribute('opacity', '1');
    }
    if (delta.w2 !== 0) {
      this.setSvgText(this.el.deltaW2, `Δw₂ = ${delta.w2 > 0 ? '+' : ''}${delta.w2.toFixed(2)}`, 108);
      this.el.deltaW2.setAttribute('fill', delta.w2 > 0 ? '#10b981' : '#f43f5e');
      this.el.deltaW2.setAttribute('opacity', '1');
    }
    if (delta.b !== 0) {
      this.setSvgText(this.el.deltaB, `Δb = ${delta.b > 0 ? '+' : ''}${delta.b.toFixed(2)}`, 90);
      this.el.deltaB.setAttribute('fill', delta.b > 0 ? '#10b981' : '#f43f5e');
      this.el.deltaB.setAttribute('opacity', '1');
    }
  }

  /**
   * Updates the mathematical equation bar beneath the SVG.
   * Clearly shows every intermediate step and mathematical justification.
   */
  renderEquationBar(data) {
    if (!this.equationEl) return;

    const { x1, x2, target, w1, w2, b, w1x1, w2x2, z, yHat, error, deltaW1, deltaW2, deltaB, hasUpdated, learningRate, phase = 3 } = data;

    const zSign = z >= 0 ? '≥ 0' : '< 0';
    const errorColorClass = error === 0 ? 'math-success' : 'math-error';

    let updateMarkup = '';
    if (hasUpdated || error !== 0) {
      updateMarkup = `
        <div class="math-block math-update-block">
          <span class="math-label">ROSENBLATT PARAMETER UPDATE (η = ${learningRate}):</span>
          <div class="math-expr">
            <span>Δw₁ = η·e·x₁ = (${learningRate})·(${error})·(${x1}) = <strong class="${deltaW1 >= 0 ? 'val-pos' : 'val-neg'}">${deltaW1 >= 0 ? '+' : ''}${deltaW1.toFixed(2)}</strong></span>
            <span class="math-sep">|</span>
            <span>Δw₂ = η·e·x₂ = (${learningRate})·(${error})·(${x2}) = <strong class="${deltaW2 >= 0 ? 'val-pos' : 'val-neg'}">${deltaW2 >= 0 ? '+' : ''}${deltaW2.toFixed(2)}</strong></span>
            <span class="math-sep">|</span>
            <span>Δb = η·e = (${learningRate})·(${error}) = <strong class="${deltaB >= 0 ? 'val-pos' : 'val-neg'}">${deltaB >= 0 ? '+' : ''}${deltaB.toFixed(2)}</strong></span>
          </div>
        </div>
      `;
    } else {
      updateMarkup = `
        <div class="math-block math-no-update-block">
          <span class="math-label">UPDATE STATUS:</span>
          <span class="math-expr text-success">e = 0 → No parameter modification needed (weights remain stable)</span>
        </div>
      `;
    }

    this.equationEl.innerHTML = `
      <div class="math-breakdown-grid">
        <div class="math-block">
          <span class="math-label">1. WEIGHTED SUM (NET INPUT):</span>
          <span class="math-expr">
            z = (w₁·x₁) + (w₂·x₂) + b = (${w1.toFixed(2)}·${x1}) + (${w2.toFixed(2)}·${x2}) + (${b.toFixed(2)}) = <strong>${z.toFixed(2)}</strong>
          </span>
        </div>
        <div class="math-block">
          <span class="math-label">2. HEAVISIDE STEP ACTIVATION:</span>
          <span class="math-expr">
            ŷ = Θ(${z.toFixed(2)}) : [${z.toFixed(2)} ${zSign}] → <strong>ŷ = ${yHat}</strong>
          </span>
        </div>
        <div class="math-block ${errorColorClass}">
          <span class="math-label">3. TARGET & ERROR COMPARISON:</span>
          <span class="math-expr">
            e = y - ŷ = ${target} - ${yHat} = <strong>${error >= 0 ? '+' : ''}${error}</strong>
            <span class="math-tag ${error === 0 ? 'tag-correct' : 'tag-error'}">${error === 0 ? '✓ MATCH' : '✗ MISMATCH'}</span>
          </span>
        </div>
        ${updateMarkup}
      </div>
    `;
  }
}
