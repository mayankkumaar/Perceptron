/**
 * 2D Decision Boundary Canvas Visualizer
 * Plots the binary input space, target classes, classification half-spaces,
 * the linear decision boundary line (w1*x1 + w2*x2 + b = 0), and normal vector.
 * Handles all geometric degenerate cases (zero weights, vertical lines, horizontal lines).
 */

import { Perceptron } from './perceptron.js';

export class DecisionBoundaryVisualizer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} [tooltipEl]
   */
  constructor(canvas, tooltipEl = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltip = tooltipEl;

    // Viewport bounds in math coordinate space
    this.domain = {
      minX: -0.35,
      maxX: 1.35,
      minY: -0.35,
      maxY: 1.35
    };

    // State cache
    this.currentWeights = { w1: 0, w2: 0, b: 0 };
    this.table = [];
    this.activeSampleIndex = -1;
    this.hoverPoint = null;

    this.initCanvasSize();
    this.setupInteractivity();
  }

  /**
   * Handles Retina / High-DPI screens without blurry pixels.
   */
  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 420;
    this.height = rect.height || 420;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Transforms math coordinates (x1, x2) to canvas pixel coordinates.
   */
  mathToCanvas(x1, x2) {
    const { minX, maxX, minY, maxY } = this.domain;
    const px = ((x1 - minX) / (maxX - minX)) * this.width;
    const py = this.height - ((x2 - minY) / (maxY - minY)) * this.height;
    return { px, py };
  }

  /**
   * Transforms canvas pixel coordinates to math coordinates (x1, x2).
   */
  canvasToMath(px, py) {
    const { minX, maxX, minY, maxY } = this.domain;
    const x1 = minX + (px / this.width) * (maxX - minX);
    const x2 = minY + ((this.height - py) / this.height) * (maxY - minY);
    return { x1, x2 };
  }

  /**
   * Setup interactive mouse tracking for plane inspection.
   */
  setupInteractivity() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { x1, x2 } = this.canvasToMath(px, py);
      this.hoverPoint = { x1, x2, px, py };
      this.render();

      if (this.tooltip) {
        const { w1, w2, b } = this.currentWeights;
        const z = Perceptron.round(w1 * x1 + w2 * x2 + b, 3);
        const yHat = Perceptron.step(z);
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${e.clientX + 14}px`;
        this.tooltip.style.top = `${e.clientY + 14}px`;
        this.tooltip.innerHTML = `
          <div class="tooltip-title">Plane Inspector</div>
          <div>Point: <strong>(${x1.toFixed(2)}, ${x2.toFixed(2)})</strong></div>
          <div>z = (${w1.toFixed(2)}·${x1.toFixed(2)}) + (${w2.toFixed(2)}·${x2.toFixed(2)}) + (${b.toFixed(2)}) = <strong>${z.toFixed(2)}</strong></div>
          <div>Predicted Region: <strong class="${yHat === 1 ? 'text-cyan' : 'text-slate'}">Class ${yHat}</strong></div>
        `;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPoint = null;
      if (this.tooltip) this.tooltip.style.display = 'none';
      this.render();
    });

    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });
  }

  /**
   * Main render function
   * @param {Object} [data]
   * @param {Object} [data.weights]
   * @param {Array}  [data.table]
   * @param {number} [data.activeSampleIndex]
   */
  render(data = null) {
    if (data) {
      if (data.weights) this.currentWeights = { ...data.weights };
      if (data.table) this.table = data.table;
      if (data.activeSampleIndex !== undefined) this.activeSampleIndex = data.activeSampleIndex;
    }

    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Decision Regions (Half-spaces for z >= 0 and z < 0)
    this.drawClassificationRegions();

    // 2. Draw Grid, Axes, and Coordinate Labels
    this.drawGridAndAxes();

    // 3. Draw Decision Boundary Line (w1*x1 + w2*x2 + b = 0)
    this.drawBoundaryLine();

    // 4. Draw Binary Data Points (0,0), (0,1), (1,0), (1,1)
    this.drawDataPoints();

    // 5. Draw Hover Point inspection if active
    if (this.hoverPoint) {
      this.drawHoverPoint();
    }
  }

  /**
   * Shading of the 2D plane:
   * Uses low-resolution scan or polygon fill to paint predicted class regions.
   */
  drawClassificationRegions() {
    const { ctx, width, height } = this;
    const { w1, w2, b } = this.currentWeights;

    // Both weights zero edge case
    if (Math.abs(w1) < 1e-6 && Math.abs(w2) < 1e-6) {
      const pred = b >= 0 ? 1 : 0;
      ctx.fillStyle = pred === 1 ? 'rgba(2, 132, 199, 0.12)' : 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // High performance raster classification grid (step of 4px)
    const step = 6;
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const { x1, x2 } = this.canvasToMath(px + step / 2, py + step / 2);
        const z = w1 * x1 + w2 * x2 + b;
        if (z >= 0) {
          ctx.fillStyle = 'rgba(2, 132, 199, 0.14)'; // Class 1 tint (cyan)
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';  // Class 0 tint (navy)
        }
        ctx.fillRect(px, py, step, step);
      }
    }
  }

  /**
   * Draws coordinate grid, ticks, and axes.
   */
  drawGridAndAxes() {
    const { ctx, width, height } = this;
    ctx.save();

    // Grid lines for 0.0, 0.5, 1.0
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const ticks = [0, 0.5, 1];
    for (const t of ticks) {
      // Vertical grid lines
      const { px: vPx } = this.mathToCanvas(t, 0);
      ctx.beginPath();
      ctx.moveTo(vPx, 0);
      ctx.lineTo(vPx, height);
      ctx.stroke();

      // Horizontal grid lines
      const { py: hPy } = this.mathToCanvas(0, t);
      ctx.beginPath();
      ctx.moveTo(0, hPy);
      ctx.lineTo(width, hPy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Main Axes: x1 = 0 and x2 = 0
    const origin = this.mathToCanvas(0, 0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // x1 axis (horizontal)
    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();

    // x2 axis (vertical)
    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();

    // Axis Labels and Ticks
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';

    // x1 tick labels
    ctx.fillText('0.0', origin.px - 14, origin.py + 15);
    const tick1 = this.mathToCanvas(1, 0);
    ctx.fillText('1.0', tick1.px - 8, origin.py + 15);

    // x2 tick labels
    const tick2 = this.mathToCanvas(0, 1);
    ctx.fillText('1.0', origin.px - 26, tick2.py + 4);

    // Axis titles
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('x₁ (Input 1) →', width - 82, origin.py - 8);
    ctx.fillText('↑ x₂ (Input 2)', origin.px + 8, 16);

    ctx.restore();
  }

  /**
   * Draws the decision boundary line:
   * w1*x1 + w2*x2 + b = 0
   */
  drawBoundaryLine() {
    const { ctx, width, height } = this;
    const { w1, w2, b } = this.currentWeights;

    // Degenerate case 1: both weights zero
    if (Math.abs(w1) < 1e-6 && Math.abs(w2) < 1e-6) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 11px Inter, sans-serif';
      ctx.fillText('No boundary (w₁ = 0, w₂ = 0)', 14, height - 14);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 8;

    const { minX, maxX, minY, maxY } = this.domain;
    const linePoints = [];

    // Degenerate case 2: w2 == 0 (vertical line: x1 = -b / w1)
    if (Math.abs(w2) < 1e-6) {
      const x1 = -b / w1;
      if (x1 >= minX && x1 <= maxX) {
        const p1 = this.mathToCanvas(x1, minY);
        const p2 = this.mathToCanvas(x1, maxY);
        linePoints.push(p1, p2);
      }
    }
    // Degenerate case 3: w1 == 0 (horizontal line: x2 = -b / w2)
    else if (Math.abs(w1) < 1e-6) {
      const x2 = -b / w2;
      if (x2 >= minY && x2 <= maxY) {
        const p1 = this.mathToCanvas(minX, x2);
        const p2 = this.mathToCanvas(maxX, x2);
        linePoints.push(p1, p2);
      }
    }
    // General case: intersect line with domain box bounds
    else {
      const candidates = [
        // Intersect with x1 = minX -> x2 = -(w1*minX + b) / w2
        { x1: minX, x2: -(w1 * minX + b) / w2 },
        // Intersect with x1 = maxX -> x2 = -(w1*maxX + b) / w2
        { x1: maxX, x2: -(w1 * maxX + b) / w2 },
        // Intersect with x2 = minY -> x1 = -(w2*minY + b) / w1
        { x1: -(w2 * minY + b) / w1, x2: minY },
        // Intersect with x2 = maxY -> x1 = -(w2*maxY + b) / w1
        { x1: -(w2 * maxY + b) / w1, x2: maxY }
      ];

      for (const cand of candidates) {
        if (
          cand.x1 >= minX - 1e-4 &&
          cand.x1 <= maxX + 1e-4 &&
          cand.x2 >= minY - 1e-4 &&
          cand.x2 <= maxY + 1e-4
        ) {
          const pt = this.mathToCanvas(cand.x1, cand.x2);
          // Avoid duplicate corners
          if (!linePoints.some(p => Math.hypot(p.px - pt.px, p.py - pt.py) < 2)) {
            linePoints.push(pt);
          }
        }
      }
    }

    if (linePoints.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(linePoints[0].px, linePoints[0].py);
      ctx.lineTo(linePoints[1].px, linePoints[1].py);
      ctx.stroke();

      // Normal vector arrow indicating the positive (z >= 0) direction
      this.drawNormalVector(w1, w2, b);
    }

    ctx.restore();
  }

  /**
   * Draws a normal vector arrow showing the direction of weights w = [w1, w2].
   */
  drawNormalVector(w1, w2, b) {
    const norm = Math.hypot(w1, w2);
    if (norm < 1e-5) return;

    // Unit normal vector
    const u1 = w1 / norm;
    const u2 = w2 / norm;

    // Point on boundary closest to origin: p0 = -b * (u1, u2) / norm
    const p0x1 = -b * u1 / norm;
    const p0x2 = -b * u2 / norm;

    // Clamp base point to visible area
    const { minX, maxX, minY, maxY } = this.domain;
    const baseMathX = Math.max(minX + 0.1, Math.min(maxX - 0.1, p0x1));
    const baseMathY = Math.max(minY + 0.1, Math.min(maxY - 0.1, p0x2));

    const pBase = this.mathToCanvas(baseMathX, baseMathY);
    const arrowLen = 32;
    const pHead = {
      px: pBase.px + u1 * arrowLen,
      py: pBase.py - u2 * arrowLen
    };

    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pBase.px, pBase.py);
    ctx.lineTo(pHead.px, pHead.py);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(pHead.py - pBase.py, pHead.px - pBase.px);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(pHead.px, pHead.py);
    ctx.lineTo(
      pHead.px - headLen * Math.cos(angle - Math.PI / 6),
      pHead.py - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      pHead.px - headLen * Math.cos(angle + Math.PI / 6),
      pHead.py - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.fillText('w (z ≥ 0)', pHead.px + 6, pHead.py - 4);

    ctx.restore();
  }

  /**
   * Plots the four binary vertices (0,0), (0,1), (1,0), (1,1).
   */
  drawDataPoints() {
    const { ctx } = this;
    const { w1, w2, b } = this.currentWeights;

    this.table.forEach((item, index) => {
      const { x1, x2, y } = item;
      const { px, py } = this.mathToCanvas(x1, x2);

      // Model's current prediction on this point
      const z = w1 * x1 + w2 * x2 + b;
      const yHat = Perceptron.step(z);
      const isCorrect = (yHat === y);
      const isActive = (index === this.activeSampleIndex);

      ctx.save();

      // Active sample pulsing halo
      if (isActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer correctness indicator halo (Green = correct, Red = misclassified)
      ctx.strokeStyle = isCorrect ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill based on true target class
      if (y === 1) {
        // Class 1: Solid emerald core
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', px, py);
      } else {
        // Class 0: Dark slate core
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0', px, py);
      }

      // Point coordinate tag
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let offsetX = 16;
      let offsetY = -8;
      if (x1 === 1) offsetX = -58;
      if (x2 === 1) offsetY = 12;

      ctx.fillText(`(${x1},${x2}) y=${y}`, px + offsetX, py + offsetY);

      ctx.restore();
    });
  }

  /**
   * Draws a cursor reticle when inspecting coordinates.
   */
  drawHoverPoint() {
    const { ctx } = this;
    const { px, py } = this.hoverPoint;

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
