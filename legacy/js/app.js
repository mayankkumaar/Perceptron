/**
 * Perceptron Lab - Main Application Orchestrator
 * Connects Trainer, Perceptron, NeuronVisualizer, DecisionBoundaryVisualizer,
 * HistoryChart, TruthTable, Manual Playground, and UI controls.
 */

import { GATES } from './gates.js';
import { Perceptron } from './perceptron.js';
import { Trainer, TrainerState } from './trainer.js';
import { NeuronVisualizer } from './neuron-viz.js';
import { DecisionBoundaryVisualizer } from './boundary-viz.js';
import { HistoryChart } from './history-chart.js';
import { runAllTests } from './tests.js';

class PerceptronApp {
  constructor() {
    // 1. Initialize State & Models
    this.selectedGateId = 'AND';
    this.trainer = new Trainer({
      gateId: this.selectedGateId,
      learningRate: 0.1,
      maxEpochs: 30,
      stepDelay: 1200
    });

    // Manual Playground state
    this.playgroundInputs = { x1: 0, x2: 0 };

    // 2. Cache DOM Elements
    this.cacheElements();

    // 3. Initialize Visualizers
    this.neuronViz = new NeuronVisualizer(
      this.dom.neuronSvg,
      this.dom.equationBar
    );

    this.boundaryViz = new DecisionBoundaryVisualizer(
      this.dom.boundaryCanvas,
      this.dom.boundaryTooltip
    );

    this.historyChart = new HistoryChart(
      this.dom.historyCanvas,
      this.dom.historyTooltip
    );

    // 4. Bind Events & UI Listeners
    this.bindTrainerEvents();
    this.bindUIEvents();

    // 5. Initial Render
    this.applyGateChange(this.selectedGateId);
    this.updatePlaygroundInference();
  }

  cacheElements() {
    this.dom = {
      // Gates
      gateBtns: document.querySelectorAll('.gate-select-btn'),
      gateBadge: document.getElementById('gate-badge'),
      gateName: document.getElementById('gate-name-display'),
      gateExpr: document.getElementById('gate-expr-display'),
      gateDesc: document.getElementById('gate-desc-display'),
      gateSeparableBanner: document.getElementById('gate-separable-banner'),

      // Truth Table
      truthTableBody: document.getElementById('truth-table-body'),

      // Visualization Containers
      neuronSvg: document.getElementById('neuron-svg'),
      equationBar: document.getElementById('equation-bar'),
      boundaryCanvas: document.getElementById('boundary-canvas'),
      boundaryTooltip: document.getElementById('boundary-tooltip'),
      historyCanvas: document.getElementById('history-canvas'),
      historyTooltip: document.getElementById('history-tooltip'),
      historyModeBtns: document.querySelectorAll('.chart-mode-btn'),

      // Metrics
      metricStatus: document.getElementById('metric-status'),
      metricEpoch: document.getElementById('metric-epoch'),
      metricSample: document.getElementById('metric-sample'),
      metricAccuracy: document.getElementById('metric-accuracy'),
      metricErrors: document.getElementById('metric-errors'),
      metricW1: document.getElementById('metric-w1'),
      metricW2: document.getElementById('metric-w2'),
      metricB: document.getElementById('metric-b'),
      metricZ: document.getElementById('metric-z'),
      metricPred: document.getElementById('metric-pred'),
      metricTarget: document.getElementById('metric-target'),
      metricError: document.getElementById('metric-error'),

      // Controls
      btnStart: document.getElementById('btn-start-pause'),
      btnStep: document.getElementById('btn-step'),
      btnEpoch: document.getElementById('btn-epoch'),
      btnFastForward: document.getElementById('btn-fast-forward'),
      btnReset: document.getElementById('btn-reset'),
      btnRandomize: document.getElementById('btn-randomize'),

      sliderSpeed: document.getElementById('slider-speed'),
      valSpeed: document.getElementById('val-speed'),
      sliderLr: document.getElementById('slider-lr'),
      valLr: document.getElementById('val-lr'),
      sliderEpochs: document.getElementById('slider-epochs'),
      valEpochs: document.getElementById('val-epochs'),
      checkReducedMotion: document.getElementById('check-reduced-motion'),

      // Manual Playground
      btnX1_0: document.getElementById('btn-x1-0'),
      btnX1_1: document.getElementById('btn-x1-1'),
      btnX2_0: document.getElementById('btn-x2-0'),
      btnX2_1: document.getElementById('btn-x2-1'),
      pgZ: document.getElementById('pg-z-val'),
      pgYHat: document.getElementById('pg-yhat-val'),
      pgTarget: document.getElementById('pg-target-val'),
      pgMatchBadge: document.getElementById('pg-match-badge'),
      pgFormula: document.getElementById('pg-formula-val'),
      btnPgTrain: document.getElementById('btn-pg-train'),

      // Test Modal
      btnRunTests: document.getElementById('btn-run-tests'),
      testModal: document.getElementById('test-modal'),
      btnCloseTestModal: document.getElementById('btn-close-test-modal'),
      testSummary: document.getElementById('test-summary'),
      testList: document.getElementById('test-list')
    };
  }

  bindTrainerEvents() {
    // 1. Step Event: Fires when an individual training example is processed
    this.trainer.on('step', (data) => {
      const { snapshot, sampleIndex, nextSampleIndex, epoch, epochErrors, evalResult, gate, terminated } = data;

      // Animate SVG Perceptron with exact snapshot data
      const duration = this.trainer.reducedMotion ? 50 : Math.max(100, this.trainer.stepDelay - 100);
      this.neuronViz.animateStep(snapshot, duration);

      // Update 2D Decision Boundary
      this.boundaryViz.render({
        weights: snapshot.newParams,
        table: gate.table,
        activeSampleIndex: sampleIndex
      });

      // Update Truth Table rows with current model evaluation
      this.updateTruthTable(evalResult.predictions, sampleIndex);

      // Update Metrics Bar
      this.updateMetrics({
        epoch,
        sampleIndex,
        totalSamples: gate.table.length,
        w1: snapshot.newParams.w1,
        w2: snapshot.newParams.w2,
        b: snapshot.newParams.b,
        z: snapshot.z,
        yHat: snapshot.prediction,
        target: snapshot.target,
        error: snapshot.error,
        epochErrors,
        accuracy: evalResult.accuracy,
        correctCount: evalResult.correctCount,
        total: evalResult.total
      });

      // Synchronize manual playground feed-forward
      this.updatePlaygroundInference();
    });

    // 2. Epoch End Event: Updates history curves
    this.trainer.on('epochEnd', (data) => {
      this.historyChart.setHistory(data.history);
    });

    // 3. State Change Event: Updates button labels and badges
    this.trainer.on('stateChange', ({ newState }) => {
      this.updateControlsState(newState);
    });

    // 4. Convergence Event
    this.trainer.on('converged', ({ epoch, evalResult }) => {
      this.setMetricStatus('CONVERGED', 'status-converged', `Converged in Epoch ${epoch}! (Accuracy: 100%)`);
    });

    // 5. Max Epochs Reached
    this.trainer.on('maxEpochsReached', ({ epoch, isLinearlySeparable }) => {
      if (!isLinearlySeparable) {
        this.setMetricStatus(
          'NON-SEPARABLE',
          'status-limit',
          `Max Epochs (${epoch}) Reached: Single perceptron cannot separate XOR (Mathematical limitation)`
        );
      } else {
        this.setMetricStatus(
          'MAX EPOCHS',
          'status-limit',
          `Max Epochs (${epoch}) Reached without full convergence`
        );
      }
    });

    // 6. Reset Event
    this.trainer.on('reset', ({ gate, history, evalResult }) => {
      this.neuronViz.resetVisuals();
      this.neuronViz.renderState({
        w1: this.trainer.perceptron.w1,
        w2: this.trainer.perceptron.w2,
        b: this.trainer.perceptron.b,
        x1: gate.table[0].x1,
        x2: gate.table[0].x2,
        target: gate.table[0].y,
        hasEvaluated: false
      });

      this.boundaryViz.render({
        weights: {
          w1: this.trainer.perceptron.w1,
          w2: this.trainer.perceptron.w2,
          b: this.trainer.perceptron.b
        },
        table: gate.table,
        activeSampleIndex: -1
      });

      this.historyChart.setHistory(history);
      this.updateTruthTable(evalResult.predictions, -1);

      this.updateMetrics({
        epoch: 0,
        sampleIndex: 0,
        totalSamples: gate.table.length,
        w1: this.trainer.perceptron.w1,
        w2: this.trainer.perceptron.w2,
        b: this.trainer.perceptron.b,
        z: 0,
        yHat: 0,
        target: gate.table[0].y,
        error: 0,
        epochErrors: 0,
        accuracy: evalResult.accuracy,
        correctCount: evalResult.correctCount,
        total: evalResult.total
      });

      this.setMetricStatus('IDLE', 'status-idle', 'Ready to train');
      this.updatePlaygroundInference();
    });
  }

  bindUIEvents() {
    // Logic Gate Selection Buttons
    this.dom.gateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gateId = btn.dataset.gate;
        if (gateId && gateId !== this.selectedGateId) {
          this.applyGateChange(gateId);
        }
      });
    });

    // Start / Pause Button
    this.dom.btnStart.addEventListener('click', () => {
      if (this.trainer.state === TrainerState.RUNNING) {
        this.trainer.pause();
      } else if (this.trainer.state === TrainerState.PAUSED) {
        this.trainer.resume();
      } else {
        this.trainer.start();
      }
    });

    // Single Step Button
    this.dom.btnStep.addEventListener('click', () => {
      this.trainer.trainOneStep();
    });

    // Run One Epoch Button
    this.dom.btnEpoch.addEventListener('click', () => {
      this.trainer.runOneEpoch();
    });

    // Fast Forward Button
    this.dom.btnFastForward.addEventListener('click', () => {
      this.trainer.fastForward();
    });

    // Reset Button
    this.dom.btnReset.addEventListener('click', () => {
      this.trainer.reset();
    });

    // Randomize Weights Button
    this.dom.btnRandomize.addEventListener('click', () => {
      this.trainer.randomizeWeights();
    });

    // Animation Speed Slider
    // Values: 1 (Slow: 2000ms), 2 (Normal: 1200ms), 3 (Fast: 500ms), 4 (Rapid: 150ms)
    this.dom.sliderSpeed.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      let delay = 1200;
      let label = '1.0x (Normal)';
      if (val === 1) { delay = 2200; label = '0.5x (Slow)'; }
      else if (val === 2) { delay = 1200; label = '1.0x (Normal)'; }
      else if (val === 3) { delay = 600;  label = '2.0x (Fast)'; }
      else if (val === 4) { delay = 150;  label = '5.0x (Rapid)'; }

      this.trainer.setStepDelay(delay);
      this.dom.valSpeed.textContent = label;
    });

    // Learning Rate Slider (0.05 to 1.0)
    this.dom.sliderLr.addEventListener('input', (e) => {
      const lr = parseFloat(e.target.value);
      this.trainer.setLearningRate(lr);
      this.dom.valLr.textContent = lr.toFixed(2);
    });

    // Max Epochs Slider (5 to 100)
    this.dom.sliderEpochs.addEventListener('input', (e) => {
      const epochs = parseInt(e.target.value, 10);
      this.trainer.setMaxEpochs(epochs);
      this.dom.valEpochs.textContent = `${epochs}`;
    });

    // Reduced Motion Checkbox
    this.dom.checkReducedMotion.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      this.trainer.reducedMotion = isChecked;
      this.neuronViz.reducedMotion = isChecked;
    });

    // History Chart View Mode Switcher
    this.dom.historyModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.historyModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.historyChart.setViewMode(mode);
      });
    });

    // Manual Playground Inputs
    this.dom.btnX1_0.addEventListener('click', () => this.setPlaygroundInput('x1', 0));
    this.dom.btnX1_1.addEventListener('click', () => this.setPlaygroundInput('x1', 1));
    this.dom.btnX2_0.addEventListener('click', () => this.setPlaygroundInput('x2', 0));
    this.dom.btnX2_1.addEventListener('click', () => this.setPlaygroundInput('x2', 1));

    // Manual Playground Train on Sample Button
    this.dom.btnPgTrain.addEventListener('click', () => {
      const { x1, x2 } = this.playgroundInputs;
      const target = this.getGateTarget(x1, x2);
      const snapshot = this.trainer.perceptron.trainSample(x1, x2, target);

      // Flash animation on neuron
      this.neuronViz.animateStep(snapshot, 600);

      const evalResult = this.trainer.perceptron.evaluate(this.trainer.gate.table);

      this.boundaryViz.render({
        weights: snapshot.newParams,
        table: this.trainer.gate.table,
        activeSampleIndex: this.findSampleIndex(x1, x2)
      });

      this.updateTruthTable(evalResult.predictions, this.findSampleIndex(x1, x2));
      this.updatePlaygroundInference();

      this.updateMetrics({
        epoch: this.trainer.currentEpoch,
        sampleIndex: this.findSampleIndex(x1, x2),
        totalSamples: 4,
        w1: snapshot.newParams.w1,
        w2: snapshot.newParams.w2,
        b: snapshot.newParams.b,
        z: snapshot.z,
        yHat: snapshot.prediction,
        target: snapshot.target,
        error: snapshot.error,
        epochErrors: this.trainer.epochErrors,
        accuracy: evalResult.accuracy,
        correctCount: evalResult.correctCount,
        total: 4
      });
    });

    // Unit Tests Modal Trigger
    this.dom.btnRunTests.addEventListener('click', () => {
      this.openUnitTestsModal();
    });

    this.dom.btnCloseTestModal.addEventListener('click', () => {
      this.dom.testModal.classList.remove('open');
    });

    this.dom.testModal.addEventListener('click', (e) => {
      if (e.target === this.dom.testModal) {
        this.dom.testModal.classList.remove('open');
      }
    });
  }

  applyGateChange(gateId) {
    this.selectedGateId = gateId;
    const gate = GATES[gateId];

    // Update active button state
    this.dom.gateBtns.forEach(btn => {
      const isActive = btn.dataset.gate === gateId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // Update Gate descriptions
    this.dom.gateBadge.textContent = gate.id;
    this.dom.gateName.textContent = gate.name;
    this.dom.gateExpr.textContent = gate.booleanExpr;
    this.dom.gateDesc.textContent = gate.description;

    // Linear separability alert banner
    if (gate.isLinearlySeparable) {
      this.dom.gateSeparableBanner.className = 'separable-banner separable-yes';
      this.dom.gateSeparableBanner.innerHTML = `
        <span class="banner-icon">✓</span>
        <div>
          <strong>Linearly Separable:</strong> A single linear hyperplane (w₁x₁ + w₂x₂ + b = 0) can completely separate the binary classes. Convergence to 100% accuracy is guaranteed by the Perceptron Convergence Theorem.
        </div>
      `;
    } else {
      this.dom.gateSeparableBanner.className = 'separable-banner separable-no';
      this.dom.gateSeparableBanner.innerHTML = `
        <span class="banner-icon">⚠</span>
        <div>
          <strong>NOT Linearly Separable (XOR Limitation):</strong>
          Outputs 1 for (0,1) and (1,0), but 0 for (0,0) and (1,1). No single straight line can partition these diagonal pairs. The single-neuron perceptron will oscillate and cannot reach 100% accuracy (proved by Minsky & Papert, 1969).
        </div>
      `;
    }

    // Switch trainer gate
    this.trainer.setGate(gateId);
  }

  updateControlsState(state) {
    if (state === TrainerState.RUNNING) {
      this.dom.btnStart.textContent = 'Pause';
      this.dom.btnStart.classList.add('btn-active');
      this.dom.btnStep.disabled = true;
      this.dom.btnEpoch.disabled = true;
      this.dom.btnFastForward.disabled = true;
      this.setMetricStatus('TRAINING', 'status-running', 'Training in progress...');
    } else if (state === TrainerState.PAUSED) {
      this.dom.btnStart.textContent = 'Resume';
      this.dom.btnStart.classList.remove('btn-active');
      this.dom.btnStep.disabled = false;
      this.dom.btnEpoch.disabled = false;
      this.dom.btnFastForward.disabled = false;
      this.setMetricStatus('PAUSED', 'status-paused', 'Training paused');
    } else {
      this.dom.btnStart.textContent = 'Start Training';
      this.dom.btnStart.classList.remove('btn-active');
      this.dom.btnStep.disabled = false;
      this.dom.btnEpoch.disabled = false;
      this.dom.btnFastForward.disabled = false;
    }
  }

  setMetricStatus(badgeText, badgeClass, tooltipText = '') {
    this.dom.metricStatus.textContent = badgeText;
    this.dom.metricStatus.className = `metric-status-badge ${badgeClass}`;
    if (tooltipText) {
      this.dom.metricStatus.title = tooltipText;
    }
  }

  updateMetrics(m) {
    this.dom.metricEpoch.textContent = `${m.epoch} / ${this.trainer.maxEpochs}`;
    this.dom.metricSample.textContent = `Sample #${m.sampleIndex + 1} of ${m.totalSamples}`;
    this.dom.metricAccuracy.textContent = `${Math.round(m.accuracy * 100)}% (${m.correctCount}/${m.total})`;
    this.dom.metricErrors.textContent = `${m.epochErrors}`;

    this.dom.metricW1.textContent = Perceptron.formatNumber(m.w1);
    this.dom.metricW2.textContent = Perceptron.formatNumber(m.w2);
    this.dom.metricB.textContent = Perceptron.formatNumber(m.b);

    this.dom.metricZ.textContent = Perceptron.formatNumber(m.z);
    this.dom.metricPred.textContent = `${m.yHat}`;
    this.dom.metricTarget.textContent = `${m.target}`;
    this.dom.metricError.textContent = `${m.error > 0 ? '+' : ''}${m.error}`;
    this.dom.metricError.className = m.error === 0 ? 'text-success' : 'text-error';
  }

  updateTruthTable(predictions, activeSampleIndex = -1) {
    const gate = this.trainer.gate;
    let html = '';

    gate.table.forEach((row, idx) => {
      const predItem = predictions && predictions[idx];
      const z = predItem ? predItem.z : this.trainer.perceptron.computeNetInput(row.x1, row.x2);
      const yHat = predItem ? predItem.predicted : Perceptron.step(z);
      const isMatch = (yHat === row.y);
      const isActive = (idx === activeSampleIndex);

      html += `
        <tr class="table-row ${isActive ? 'row-active' : ''} ${isMatch ? 'row-correct' : 'row-error'}" data-index="${idx}">
          <td class="cell-input"><code>${row.x1}</code></td>
          <td class="cell-input"><code>${row.x2}</code></td>
          <td class="cell-target"><span class="badge-target">${row.y}</span></td>
          <td class="cell-net"><code>${z.toFixed(2)}</code></td>
          <td class="cell-pred"><span class="badge-pred ${yHat === 1 ? 'pred-1' : 'pred-0'}">${yHat}</span></td>
          <td class="cell-status">
            ${isMatch ? '<span class="status-icon icon-correct">✓ Match</span>' : '<span class="status-icon icon-wrong">✗ Error</span>'}
          </td>
          <td class="cell-action">
            <button class="btn-inspect-row" data-x1="${row.x1}" data-x2="${row.x2}" title="Inspect in playground">Inspect</button>
          </td>
        </tr>
      `;
    });

    this.dom.truthTableBody.innerHTML = html;

    // Add row click listener to inspect in manual playground
    this.dom.truthTableBody.querySelectorAll('.btn-inspect-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const x1 = parseInt(btn.dataset.x1, 10);
        const x2 = parseInt(btn.dataset.x2, 10);
        this.setPlaygroundInput('x1', x1);
        this.setPlaygroundInput('x2', x2);
      });
    });
  }

  setPlaygroundInput(dim, val) {
    this.playgroundInputs[dim] = val;
    if (dim === 'x1') {
      this.dom.btnX1_0.classList.toggle('active', val === 0);
      this.dom.btnX1_1.classList.toggle('active', val === 1);
    } else {
      this.dom.btnX2_0.classList.toggle('active', val === 0);
      this.dom.btnX2_1.classList.toggle('active', val === 1);
    }
    this.updatePlaygroundInference();
  }

  getGateTarget(x1, x2) {
    const item = this.trainer.gate.table.find(t => t.x1 === x1 && t.x2 === x2);
    return item ? item.y : 0;
  }

  findSampleIndex(x1, x2) {
    return this.trainer.gate.table.findIndex(t => t.x1 === x1 && t.x2 === x2);
  }

  updatePlaygroundInference() {
    const { x1, x2 } = this.playgroundInputs;
    const { w1, w2, b } = this.trainer.perceptron;
    const { z, yHat, w1x1, w2x2 } = this.trainer.perceptron.predict(x1, x2);
    const target = this.getGateTarget(x1, x2);
    const isMatch = (yHat === target);

    this.dom.pgZ.textContent = `${z.toFixed(2)}`;
    this.dom.pgYHat.textContent = `${yHat}`;
    this.dom.pgTarget.textContent = `${target}`;

    if (isMatch) {
      this.dom.pgMatchBadge.textContent = '✓ Correct';
      this.dom.pgMatchBadge.className = 'playground-match-badge match-correct';
    } else {
      this.dom.pgMatchBadge.textContent = '✗ Misclassified';
      this.dom.pgMatchBadge.className = 'playground-match-badge match-error';
    }

    this.dom.pgFormula.textContent = `z = (${w1.toFixed(2)}·${x1}) + (${w2.toFixed(2)}·${x2}) + (${b.toFixed(2)}) = ${z.toFixed(2)} → ŷ = ${yHat}`;
  }

  openUnitTestsModal() {
    this.dom.testModal.classList.add('open');
    this.dom.testSummary.textContent = 'Executing test suite...';
    this.dom.testList.innerHTML = '<li class="loading">Running assertions...</li>';

    setTimeout(() => {
      const suite = runAllTests();
      this.dom.testSummary.innerHTML = `
        <div class="test-summary-card ${suite.allPassed ? 'summary-passed' : 'summary-failed'}">
          <span class="summary-status-icon">${suite.allPassed ? '✓' : '✗'}</span>
          <div>
            <strong>${suite.passed} of ${suite.total} Unit Tests Passed</strong>
            <p>${suite.allPassed ? 'All mathematical rules, updates, gate convergences, and XOR limitation verified.' : 'Some tests failed.'}</p>
          </div>
        </div>
      `;

      let listHtml = '';
      suite.results.forEach(res => {
        listHtml += `
          <li class="test-item ${res.passed ? 'test-passed' : 'test-failed'}">
            <span class="test-icon">${res.passed ? '✓' : '✗'}</span>
            <div class="test-info">
              <span class="test-name">${res.name}</span>
              ${res.details ? `<span class="test-details">${res.details}</span>` : ''}
            </div>
          </li>
        `;
      });
      this.dom.testList.innerHTML = listHtml;
    }, 150);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.perceptronApp = new PerceptronApp();
});
