/**
 * Trainer Engine & State Machine for Perceptron Lab
 * Orchestrates training iterations, event emission, epoch management,
 * convergence checking, and training history tracking.
 */

import { GATES } from './gates.js';
import { Perceptron } from './perceptron.js';

export const TrainerState = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  CONVERGED: 'CONVERGED',
  MAX_EPOCHS: 'MAX_EPOCHS'
};

export class Trainer {
  /**
   * @param {Object} options
   * @param {string} [options.gateId='AND']
   * @param {number} [options.learningRate=0.1]
   * @param {number} [options.maxEpochs=30]
   * @param {number} [options.stepDelay=1200] Milliseconds between animated steps
   */
  constructor(options = {}) {
    this.gateId = options.gateId ?? 'AND';
    this.gate = GATES[this.gateId];
    this.maxEpochs = options.maxEpochs ?? 30;
    this.stepDelay = options.stepDelay ?? 1200;
    this.reducedMotion = false;

    this.perceptron = new Perceptron({
      learningRate: options.learningRate ?? 0.1,
      ...this.gate.defaultWeights
    });

    this.state = TrainerState.IDLE;
    this.currentEpoch = 0;
    this.sampleIndex = 0;
    this.totalStepsProcessed = 0;
    this.epochErrors = 0;
    this.history = []; // Array of { epoch, errors, accuracy, w1, w2, b }

    this.timerId = null;
    this.listeners = new Map();

    // Record initial epoch 0 evaluation
    this.recordInitialHistory();
  }

  /**
   * Event registration
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unregister event listener
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(fn => fn !== callback));
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const fn of list) {
        try {
          fn(data);
        } catch (err) {
          console.error(`Error in event handler for '${event}':`, err);
        }
      }
    }
  }

  /**
   * Sets trainer state and emits stateChange event
   * @param {string} newState
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChange', { oldState, newState, state: newState });
  }

  /**
   * Switches the active logic gate and resets training.
   * @param {string} gateId
   */
  setGate(gateId) {
    if (!GATES[gateId]) return;
    this.stopTimer();
    this.gateId = gateId;
    this.gate = GATES[gateId];
    this.reset();
  }

  /**
   * Sets the learning rate parameter.
   * @param {number} lr
   */
  setLearningRate(lr) {
    this.perceptron.setLearningRate(lr);
    this.emit('paramsChange', {
      learningRate: this.perceptron.learningRate,
      w1: this.perceptron.w1,
      w2: this.perceptron.w2,
      b: this.perceptron.b
    });
  }

  /**
   * Sets the maximum epochs.
   * @param {number} max
   */
  setMaxEpochs(max) {
    this.maxEpochs = Math.max(1, parseInt(max, 10));
    this.emit('configChange', { maxEpochs: this.maxEpochs, stepDelay: this.stepDelay });
  }

  /**
   * Sets the delay in ms between animated steps.
   * @param {number} delay
   */
  setStepDelay(delay) {
    this.stepDelay = Math.max(50, delay);
    this.emit('configChange', { maxEpochs: this.maxEpochs, stepDelay: this.stepDelay });
  }

  /**
   * Records initial evaluation before any training occurs (Epoch 0).
   */
  recordInitialHistory() {
    const evalResult = this.perceptron.evaluate(this.gate.table);
    this.history = [{
      epoch: 0,
      errors: evalResult.errorCount,
      accuracy: evalResult.accuracy,
      correctCount: evalResult.correctCount,
      total: evalResult.total,
      w1: this.perceptron.w1,
      w2: this.perceptron.w2,
      b: this.perceptron.b,
      isConverged: evalResult.isConverged
    }];
  }

  /**
   * Cancels active timer without altering model or training state.
   */
  stopTimer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Starts sequential animated training from current position.
   */
  start() {
    if (this.state === TrainerState.RUNNING) return;
    if (this.state === TrainerState.CONVERGED || this.state === TrainerState.MAX_EPOCHS) {
      this.reset();
    }
    this.setState(TrainerState.RUNNING);
    this.scheduleNextStep();
  }

  /**
   * Pauses active training sequence without losing state.
   */
  pause() {
    if (this.state !== TrainerState.RUNNING) return;
    this.stopTimer();
    this.setState(TrainerState.PAUSED);
  }

  /**
   * Resumes training from paused position.
   */
  resume() {
    if (this.state !== TrainerState.PAUSED) return;
    this.setState(TrainerState.RUNNING);
    this.scheduleNextStep();
  }

  /**
   * Internal scheduler for continuous animated execution.
   */
  scheduleNextStep() {
    this.stopTimer();
    if (this.state !== TrainerState.RUNNING) return;

    this.timerId = setTimeout(() => {
      if (this.state !== TrainerState.RUNNING) return;

      const result = this.trainOneStep();

      // Check if training has terminated
      if (result.terminated) {
        this.stopTimer();
        return;
      }

      this.scheduleNextStep();
    }, this.stepDelay);
  }

  /**
   * Executes exactly one training example and returns the step snapshot.
   * Updates epoch and checks for convergence at epoch boundaries.
   *
   * @returns {{ snapshot: Object, evalResult: Object, terminated: boolean }}
   */
  trainOneStep() {
    const currentSample = this.gate.table[this.sampleIndex];
    const snapshot = this.perceptron.trainSample(
      currentSample.x1,
      currentSample.x2,
      currentSample.y
    );

    this.totalStepsProcessed++;
    if (snapshot.error !== 0) {
      this.epochErrors++;
    }

    const completedSampleIndex = this.sampleIndex;
    let epochJustEnded = false;
    let evalResult = null;
    let terminated = false;
    let completedEpochErrors = 0;

    // Advance to next sample
    this.sampleIndex++;

    // Check if an epoch completed (all 4 truth table examples processed)
    if (this.sampleIndex >= this.gate.table.length) {
      this.currentEpoch++;
      this.sampleIndex = 0;
      epochJustEnded = true;
      completedEpochErrors = this.epochErrors;

      // Evaluate model over the entire truth table
      evalResult = this.perceptron.evaluate(this.gate.table);

      // Record epoch history
      this.history.push({
        epoch: this.currentEpoch,
        errors: evalResult.errorCount,
        accuracy: evalResult.accuracy,
        correctCount: evalResult.correctCount,
        total: evalResult.total,
        w1: this.perceptron.w1,
        w2: this.perceptron.w2,
        b: this.perceptron.b,
        isConverged: evalResult.isConverged
      });

      // Check convergence or epoch limit
      if (evalResult.isConverged) {
        terminated = true;
        this.stopTimer();
        this.setState(TrainerState.CONVERGED);
        this.emit('converged', {
          epoch: this.currentEpoch,
          totalSteps: this.totalStepsProcessed,
          evalResult
        });
      } else if (this.currentEpoch >= this.maxEpochs) {
        terminated = true;
        this.stopTimer();
        this.setState(TrainerState.MAX_EPOCHS);
        this.emit('maxEpochsReached', {
          epoch: this.currentEpoch,
          totalSteps: this.totalStepsProcessed,
          evalResult,
          isLinearlySeparable: this.gate.isLinearlySeparable
        });
      }

      // Reset epoch error accumulator for the upcoming epoch
      this.epochErrors = 0;
    } else {
      evalResult = this.perceptron.evaluate(this.gate.table);
    }

    const stepData = {
      snapshot,
      sampleIndex: completedSampleIndex,
      nextSampleIndex: this.sampleIndex,
      epoch: this.currentEpoch,
      totalSteps: this.totalStepsProcessed,
      epochErrors: epochJustEnded ? completedEpochErrors : this.epochErrors,
      evalResult,
      epochJustEnded,
      gate: this.gate,
      terminated
    };

    this.emit('step', stepData);

    if (epochJustEnded) {
      this.emit('epochEnd', {
        epoch: this.currentEpoch,
        evalResult,
        history: this.history,
        terminated
      });
    }

    return { snapshot, evalResult, terminated };
  }

  /**
   * Processes one complete pass through all 4 training examples.
   */
  runOneEpoch() {
    this.stopTimer();
    if (this.state === TrainerState.CONVERGED || this.state === TrainerState.MAX_EPOCHS) {
      this.reset();
    }
    const wasRunning = (this.state === TrainerState.RUNNING);
    this.setState(TrainerState.PAUSED);

    // Process remainder of current epoch or complete fresh epoch
    const stepsToRun = this.gate.table.length - this.sampleIndex;
    for (let i = 0; i < stepsToRun; i++) {
      const { terminated } = this.trainOneStep();
      if (terminated) break;
    }
  }

  /**
   * Fast forwards training synchronously to convergence or maxEpochs.
   * Useful for quickly demonstrating convergence without animation wait times.
   */
  fastForward() {
    this.stopTimer();
    if (this.state === TrainerState.CONVERGED || this.state === TrainerState.MAX_EPOCHS) {
      this.reset();
    }

    let iterations = 0;
    const maxSteps = this.maxEpochs * this.gate.table.length * 2;

    while (
      this.state !== TrainerState.CONVERGED &&
      this.state !== TrainerState.MAX_EPOCHS &&
      iterations < maxSteps
    ) {
      const { terminated } = this.trainOneStep();
      iterations++;
      if (terminated) break;
    }
  }

  /**
   * Resets model parameters and training metrics back to baseline.
   * @param {Object} [customWeights] Optional specific weights to initialize with
   */
  reset(customWeights = null) {
    this.stopTimer();
    this.currentEpoch = 0;
    this.sampleIndex = 0;
    this.totalStepsProcessed = 0;
    this.epochErrors = 0;

    const initialWeights = customWeights ?? this.gate.defaultWeights;
    this.perceptron.setParameters(initialWeights);

    this.recordInitialHistory();
    this.setState(TrainerState.IDLE);

    this.emit('reset', {
      gate: this.gate,
      history: this.history,
      evalResult: this.perceptron.evaluate(this.gate.table)
    });
  }

  /**
   * Randomize weights and reset.
   * @param {number} [seed=null]
   */
  randomizeWeights(seed = null) {
    this.stopTimer();
    this.perceptron.randomizeWeights(seed);
    this.currentEpoch = 0;
    this.sampleIndex = 0;
    this.totalStepsProcessed = 0;
    this.epochErrors = 0;
    this.recordInitialHistory();
    this.setState(TrainerState.IDLE);

    this.emit('reset', {
      gate: this.gate,
      history: this.history,
      evalResult: this.perceptron.evaluate(this.gate.table)
    });
  }

  /**
   * Returns current snapshot of all trainer properties.
   */
  getStateSnapshot() {
    const evalResult = this.perceptron.evaluate(this.gate.table);
    return {
      state: this.state,
      gate: this.gate,
      currentEpoch: this.currentEpoch,
      sampleIndex: this.sampleIndex,
      totalStepsProcessed: this.totalStepsProcessed,
      epochErrors: this.epochErrors,
      history: [...this.history],
      perceptron: {
        w1: this.perceptron.w1,
        w2: this.perceptron.w2,
        b: this.perceptron.b,
        learningRate: this.perceptron.learningRate
      },
      evalResult
    };
  }
}
