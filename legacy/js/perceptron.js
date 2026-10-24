/**
 * Perceptron Model Implementation
 * Pure mathematical implementation of Frank Rosenblatt's single-neuron perceptron (1957).
 * Implements linear threshold logic, Rosenblatt learning rule, deterministic snapshots,
 * and convergence evaluation.
 */

export class Perceptron {
  /**
   * @param {Object} options
   * @param {number} [options.w1=0.0] Initial weight 1
   * @param {number} [options.w2=0.0] Initial weight 2
   * @param {number} [options.b=0.0]  Initial bias
   * @param {number} [options.learningRate=0.1] Learning rate eta (η)
   */
  constructor(options = {}) {
    this.w1 = options.w1 ?? 0.0;
    this.w2 = options.w2 ?? 0.0;
    this.b = options.b ?? 0.0;
    this.learningRate = options.learningRate ?? 0.1;
  }

  /**
   * Rounds a floating point number to prevent IEEE 754 precision artifacts.
   * @param {number} num
   * @param {number} [decimals=4]
   * @returns {number}
   */
  static round(num, decimals = 4) {
    const factor = 10 ** decimals;
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Format number for display with sign and fixed decimal places.
   * @param {number} num
   * @param {number} [decimals=2]
   * @returns {string}
   */
  static formatNumber(num, decimals = 2) {
    const rounded = Perceptron.round(num, decimals);
    const sign = rounded > 0 ? '+' : '';
    return sign + rounded.toFixed(decimals);
  }

  /**
   * Heaviside step activation function:
   * Θ(z) = 1 if z >= 0, otherwise 0.
   * @param {number} z Net weighted sum
   * @returns {number} 0 or 1
   */
  static step(z) {
    return z >= 0 ? 1 : 0;
  }

  /**
   * Computes the weighted sum (net input):
   * z = w1*x1 + w2*x2 + b
   * @param {number} x1
   * @param {number} x2
   * @returns {number}
   */
  computeNetInput(x1, x2) {
    const z = this.w1 * x1 + this.w2 * x2 + this.b;
    return Perceptron.round(z, 6);
  }

  /**
   * Forward pass: computes net input z and predicted output yHat.
   * @param {number} x1
   * @param {number} x2
   * @returns {{ z: number, yHat: number, w1x1: number, w2x2: number }}
   */
  predict(x1, x2) {
    const w1x1 = Perceptron.round(this.w1 * x1, 6);
    const w2x2 = Perceptron.round(this.w2 * x2, 6);
    const z = Perceptron.round(w1x1 + w2x2 + this.b, 6);
    const yHat = Perceptron.step(z);
    return { z, yHat, w1x1, w2x2 };
  }

  /**
   * Executes one training step on a single example (x1, x2) with target y.
   * Updates weights and bias according to the Rosenblatt Perceptron Learning Rule:
   *   error = target - prediction
   *   Δw1 = η * error * x1
   *   Δw2 = η * error * x2
   *   Δb  = η * error
   *
   * Returns a complete, deterministic state snapshot of the computation.
   *
   * @param {number} x1
   * @param {number} x2
   * @param {number} y Target label (0 or 1)
   * @returns {Object} State snapshot
   */
  trainSample(x1, x2, y) {
    const oldParams = {
      w1: this.w1,
      w2: this.w2,
      b: this.b
    };

    const { z, yHat, w1x1, w2x2 } = this.predict(x1, x2);
    const error = y - yHat;

    // Perceptron Learning Rule updates
    const deltaW1 = Perceptron.round(this.learningRate * error * x1, 6);
    const deltaW2 = Perceptron.round(this.learningRate * error * x2, 6);
    const deltaB = Perceptron.round(this.learningRate * error, 6);

    const hasUpdated = error !== 0;

    // Apply parameter updates
    this.w1 = Perceptron.round(this.w1 + deltaW1, 6);
    this.w2 = Perceptron.round(this.w2 + deltaW2, 6);
    this.b = Perceptron.round(this.b + deltaB, 6);

    const newParams = {
      w1: this.w1,
      w2: this.w2,
      b: this.b
    };

    return {
      inputs: { x1, x2 },
      target: y,
      oldParams,
      weightedProducts: { w1x1, w2x2 },
      z,
      prediction: yHat,
      error,
      delta: {
        w1: deltaW1,
        w2: deltaW2,
        b: deltaB
      },
      newParams,
      hasUpdated,
      learningRate: this.learningRate
    };
  }

  /**
   * Evaluates the perceptron over a complete dataset (truth table).
   * @param {Array<{x1: number, x2: number, y: number}>} dataset
   * @returns {Object} Evaluation summary
   */
  evaluate(dataset) {
    let correctCount = 0;
    let errorCount = 0;
    const predictions = [];

    for (const item of dataset) {
      const { z, yHat } = this.predict(item.x1, item.x2);
      const isCorrect = (yHat === item.y);
      if (isCorrect) {
        correctCount++;
      } else {
        errorCount++;
      }
      predictions.push({
        x1: item.x1,
        x2: item.x2,
        expected: item.y,
        predicted: yHat,
        z,
        isCorrect
      });
    }

    const accuracy = correctCount / dataset.length;
    const isConverged = (errorCount === 0);

    return {
      total: dataset.length,
      correctCount,
      errorCount,
      accuracy,
      isConverged,
      predictions
    };
  }

  /**
   * Resets weights and bias to specific values.
   * @param {Object} [params]
   * @param {number} [params.w1=0.0]
   * @param {number} [params.w2=0.0]
   * @param {number} [params.b=0.0]
   */
  setParameters(params = {}) {
    this.w1 = params.w1 ?? 0.0;
    this.w2 = params.w2 ?? 0.0;
    this.b = params.b ?? 0.0;
  }

  /**
   * Sets the learning rate.
   * @param {number} lr
   */
  setLearningRate(lr) {
    if (lr > 0) {
      this.learningRate = lr;
    }
  }

  /**
   * Generates pseudo-random deterministic weights based on a seed or random range.
   * @param {number} [seed=42]
   */
  randomizeWeights(seed = null) {
    if (seed !== null) {
      // Reproducible linear congruential generator (LCG)
      let s = seed % 2147483647;
      if (s <= 0) s += 2147483646;
      const nextRand = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646; // in [0, 1)
      };
      this.w1 = Perceptron.round((nextRand() * 0.8) - 0.4, 2);
      this.w2 = Perceptron.round((nextRand() * 0.8) - 0.4, 2);
      this.b = Perceptron.round((nextRand() * 0.8) - 0.4, 2);
    } else {
      this.w1 = Perceptron.round((Math.random() * 0.8) - 0.4, 2);
      this.w2 = Perceptron.round((Math.random() * 0.8) - 0.4, 2);
      this.b = Perceptron.round((Math.random() * 0.8) - 0.4, 2);
    }
  }

  /**
   * Deep copy of the perceptron state.
   * @returns {Perceptron}
   */
  clone() {
    return new Perceptron({
      w1: this.w1,
      w2: this.w2,
      b: this.b,
      learningRate: this.learningRate
    });
  }
}
