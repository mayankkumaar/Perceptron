/**
 * Training History Chart (Canvas)
 * Renders real-time training progress curves over epochs:
 * - Misclassified examples per epoch (0 to 4)
 * - Training Accuracy (0% to 100%)
 * - Parameter evolution (w1, w2, b)
 * Features High-DPI crisp rendering, hover tooltips, and zero third-party dependencies.
 */

export class HistoryChart {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} [tooltipEl]
   */
  constructor(canvas, tooltipEl = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltip = tooltipEl;

    this.history = []; // [{ epoch, errors, accuracy, w1, w2, b }, ...]
    this.viewMode = 'performance'; // 'performance' | 'weights'
    this.hoverIndex = -1;

    this.initCanvasSize();
    this.setupInteractivity();
  }

  /**
   * High-DPI scaling
   */
  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 420;
    this.height = rect.height || 260;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Set view mode ('performance' or 'weights')
   * @param {string} mode
   */
  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  }

  /**
   * Set history dataset
   * @param {Array} history
   */
  setHistory(history) {
    this.history = Array.isArray(history) ? [...history] : [];
    this.render();
  }

  /**
   * Add interactive hover tooltip
   */
  setupInteractivity() {
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.history.length === 0) return;

      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const padding = { top: 30, right: 30, bottom: 35, left: 45 };
      const plotWidth = this.width - padding.left - padding.right;

      if (px < padding.left || px > this.width - padding.right) {
        this.hoverIndex = -1;
        if (this.tooltip) this.tooltip.style.display = 'none';
        this.render();
        return;
      }

      const maxEpoch = Math.max(1, this.history[this.history.length - 1].epoch);
      const frac = (px - padding.left) / plotWidth;
      const targetEpoch = Math.round(frac * maxEpoch);

      // Find closest item in history
      let closestIdx = 0;
      let minDiff = Infinity;
      this.history.forEach((h, i) => {
        const diff = Math.abs(h.epoch - targetEpoch);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });

      this.hoverIndex = closestIdx;
      this.render();

      if (this.tooltip && this.history[closestIdx]) {
        const item = this.history[closestIdx];
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${e.clientX + 14}px`;
        this.tooltip.style.top = `${e.clientY + 14}px`;
        this.tooltip.innerHTML = `
          <div class="tooltip-title">Epoch ${item.epoch}</div>
          <div>Errors: <strong class="${item.errors === 0 ? 'text-success' : 'text-error'}">${item.errors} / 4</strong></div>
          <div>Accuracy: <strong>${Math.round(item.accuracy * 100)}%</strong></div>
          <div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">
            w₁: ${item.w1.toFixed(2)} | w₂: ${item.w2.toFixed(2)} | b: ${item.b.toFixed(2)}
          </div>
        `;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      if (this.tooltip) this.tooltip.style.display = 'none';
      this.render();
    });

    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });
  }

  /**
   * Main render loop
   */
  render() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 35, bottom: 35, left: 45 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Check empty state
    if (!this.history || this.history.length === 0) {
      this.drawEmptyState(width, height);
      return;
    }

    const maxEpoch = Math.max(1, this.history[this.history.length - 1].epoch);

    // Coordinate mapping helper
    const getX = (epoch) => padding.left + (epoch / maxEpoch) * plotWidth;

    // Draw Grid & Axes
    this.drawChartAxes(padding, plotWidth, plotHeight, maxEpoch);

    if (this.viewMode === 'performance') {
      this.drawPerformanceSeries(padding, plotWidth, plotHeight, maxEpoch, getX);
    } else {
      this.drawWeightsSeries(padding, plotWidth, plotHeight, maxEpoch, getX);
    }

    // Draw Hover Cursor
    if (this.hoverIndex >= 0 && this.hoverIndex < this.history.length) {
      const item = this.history[this.hoverIndex];
      const hX = getX(item.epoch);

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, padding.top + plotHeight);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Renders empty state message when no training epochs have finished.
   */
  drawEmptyState(width, height) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No training history recorded yet.', width / 2, height / 2 - 8);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Click "Start Training" or "Train One Epoch" to observe learning curves.', width / 2, height / 2 + 12);
    ctx.restore();
  }

  /**
   * Draws axes and grid lines.
   */
  drawChartAxes(padding, plotWidth, plotHeight, maxEpoch) {
    const { ctx } = this;
    ctx.save();

    // Subtle horizontal grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();

      // Left axis labels (Misclassified errors 4 -> 0 or weights)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      if (this.viewMode === 'performance') {
        const errVal = 4 - i;
        ctx.fillText(`${errVal}`, padding.left - 8, y);
      }
    }

    // Right axis labels (Accuracy 0% -> 100%)
    if (this.viewMode === 'performance') {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10b981';
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (i / 4) * plotHeight;
        const accVal = 100 - i * 25;
        ctx.fillText(`${accVal}%`, padding.left + plotWidth + 6, y);
      }
    }

    // Bottom axis labels (Epochs)
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const step = maxEpoch <= 10 ? 1 : Math.ceil(maxEpoch / 5);
    for (let ep = 0; ep <= maxEpoch; ep += step) {
      const x = padding.left + (ep / maxEpoch) * plotWidth;
      ctx.fillText(`${ep}`, x, padding.top + plotHeight + 8);
    }

    // Axis titles
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Epochs →', padding.left + plotWidth / 2, padding.top + plotHeight + 22);

    ctx.restore();
  }

  /**
   * Draws errors and accuracy curves.
   */
  drawPerformanceSeries(padding, plotWidth, plotHeight, maxEpoch, getX) {
    const { ctx } = this;
    const getYErrors = (errors) => padding.top + ((4 - errors) / 4) * plotHeight;
    const getYAcc = (acc) => padding.top + ((1 - acc) * plotHeight);

    // 1. Errors Curve (Coral / Rose line)
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    this.history.forEach((h, i) => {
      const x = getX(h.epoch);
      const y = getYErrors(h.errors);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points on Error curve
    this.history.forEach((h) => {
      const x = getX(h.epoch);
      const y = getYErrors(h.errors);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Accuracy Curve (Emerald line)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    this.history.forEach((h, i) => {
      const x = getX(h.epoch);
      const y = getYAcc(h.accuracy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points on Accuracy curve
    ctx.setLineDash([]);
    this.history.forEach((h) => {
      const x = getX(h.epoch);
      const y = getYAcc(h.accuracy);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draws evolution of weights w1, w2, and bias b.
   */
  drawWeightsSeries(padding, plotWidth, plotHeight, maxEpoch, getX) {
    const { ctx } = this;

    // Find min and max weight values for auto-scaling
    let minVal = -0.5;
    let maxVal = 0.5;
    this.history.forEach((h) => {
      minVal = Math.min(minVal, h.w1, h.w2, h.b);
      maxVal = Math.max(maxVal, h.w1, h.w2, h.b);
    });
    const span = Math.max(0.2, maxVal - minVal);
    const getY = (val) => padding.top + (1 - (val - minVal) / span) * plotHeight;

    // Draw w1 curve (Sky blue)
    this.drawSingleWeightLine(getX, getY, (h) => h.w1, '#38bdf8');
    // Draw w2 curve (Indigo)
    this.drawSingleWeightLine(getX, getY, (h) => h.w2, '#818cf8');
    // Draw b curve (Amber)
    this.drawSingleWeightLine(getX, getY, (h) => h.b, '#f59e0b');

    // Draw zero line if visible
    if (minVal <= 0 && maxVal >= 0) {
      const zeroY = getY(0);
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(padding.left + plotWidth, zeroY);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawSingleWeightLine(getX, getY, accessor, color) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.history.forEach((h, i) => {
      const x = getX(h.epoch);
      const y = getY(accessor(h));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    this.history.forEach((h) => {
      const x = getX(h.epoch);
      const y = getY(accessor(h));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}
