/**
 * Perceptron Lab - Mathematical and Algorithmic Unit Tests
 * Can be run in Node.js (CLI) or executed directly in the browser.
 */

import { GATES } from './gates.js';
import { Perceptron } from './perceptron.js';
import { Trainer, TrainerState } from './trainer.js';

export function runAllTests() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      passedCount++;
      results.push({ name: testName, passed: true, details });
    } else {
      failedCount++;
      results.push({ name: testName, passed: false, details: `FAILED: ${details}` });
    }
  }

  // --- Suite 1: Step Activation Function ---
  assert(
    'Step activation: Θ(0) = 1 (threshold test)',
    Perceptron.step(0) === 1,
    `Expected 1, got ${Perceptron.step(0)}`
  );
  assert(
    'Step activation: Θ(0.001) = 1',
    Perceptron.step(0.001) === 1,
    `Expected 1, got ${Perceptron.step(0.001)}`
  );
  assert(
    'Step activation: Θ(-0.001) = 0',
    Perceptron.step(-0.001) === 0,
    `Expected 0, got ${Perceptron.step(-0.001)}`
  );

  // --- Suite 2: Net Input & Forward Pass ---
  const p = new Perceptron({ w1: 0.5, w2: -0.2, b: -0.1, learningRate: 0.1 });
  const fwd1 = p.predict(1, 1);
  // z = 0.5*1 + (-0.2)*1 + (-0.1) = 0.2 >= 0 -> yHat = 1
  assert(
    'Forward pass: predict(1,1) with w=[0.5, -0.2], b=-0.1 -> z=0.2, yHat=1',
    Math.abs(fwd1.z - 0.2) < 1e-4 && fwd1.yHat === 1,
    `z=${fwd1.z}, yHat=${fwd1.yHat}`
  );

  const fwd2 = p.predict(0, 1);
  // z = 0.5*0 + (-0.2)*1 + (-0.1) = -0.3 < 0 -> yHat = 0
  assert(
    'Forward pass: predict(0,1) with w=[0.5, -0.2], b=-0.1 -> z=-0.3, yHat=0',
    Math.abs(fwd2.z - (-0.3)) < 1e-4 && fwd2.yHat === 0,
    `z=${fwd2.z}, yHat=${fwd2.yHat}`
  );

  // --- Suite 3: Single-step Rosenblatt Update ---
  // Start with w1=0, w2=0, b=0, lr=0.1
  const pUpdate = new Perceptron({ w1: 0, w2: 0, b: 0, learningRate: 0.1 });
  // Train on (0, 0) with target 0:
  // z = 0 >= 0 -> yHat = 1. error = 0 - 1 = -1.
  // Δw1 = 0.1 * (-1) * 0 = 0
  // Δw2 = 0.1 * (-1) * 0 = 0
  // Δb  = 0.1 * (-1) = -0.1
  const snap1 = pUpdate.trainSample(0, 0, 0);
  assert(
    'Rosenblatt Update: Sample (0,0) target 0 -> b changes from 0 to -0.1',
    snap1.error === -1 &&
    snap1.newParams.w1 === 0 &&
    snap1.newParams.w2 === 0 &&
    Math.abs(snap1.newParams.b - (-0.1)) < 1e-4,
    `new b=${snap1.newParams.b}, deltaB=${snap1.delta.b}`
  );

  // Next sample (1, 1) target 1 with w=[0,0], b=-0.1:
  // z = 0(1) + 0(1) - 0.1 = -0.1 < 0 -> yHat = 0. error = 1 - 0 = +1.
  // Δw1 = 0.1 * 1 * 1 = +0.1
  // Δw2 = 0.1 * 1 * 1 = +0.1
  // Δb  = 0.1 * 1 = +0.1 -> new b = -0.1 + 0.1 = 0.0
  const snap2 = pUpdate.trainSample(1, 1, 1);
  assert(
    'Rosenblatt Update: Sample (1,1) target 1 -> w1=0.1, w2=0.1, b=0.0',
    snap2.error === 1 &&
    Math.abs(snap2.newParams.w1 - 0.1) < 1e-4 &&
    Math.abs(snap2.newParams.w2 - 0.1) < 1e-4 &&
    Math.abs(snap2.newParams.b - 0.0) < 1e-4,
    `w1=${snap2.newParams.w1}, w2=${snap2.newParams.w2}, b=${snap2.newParams.b}`
  );

  // --- Suite 4: Convergence on Linearly Separable Gates ---
  // AND Gate convergence test
  const andTrainer = new Trainer({ gateId: 'AND', learningRate: 0.1, maxEpochs: 30 });
  andTrainer.fastForward();
  const andEval = andTrainer.perceptron.evaluate(GATES.AND.table);
  assert(
    'Convergence: AND Gate converges with 100% accuracy (4/4)',
    andTrainer.state === TrainerState.CONVERGED && andEval.isConverged && andEval.accuracy === 1.0,
    `Epochs=${andTrainer.currentEpoch}, Accuracy=${andEval.accuracy}, Errors=${andEval.errorCount}`
  );

  // OR Gate convergence test
  const orTrainer = new Trainer({ gateId: 'OR', learningRate: 0.1, maxEpochs: 30 });
  orTrainer.fastForward();
  const orEval = orTrainer.perceptron.evaluate(GATES.OR.table);
  assert(
    'Convergence: OR Gate converges with 100% accuracy (4/4)',
    orTrainer.state === TrainerState.CONVERGED && orEval.isConverged && orEval.accuracy === 1.0,
    `Epochs=${orTrainer.currentEpoch}, Accuracy=${orEval.accuracy}, Errors=${orEval.errorCount}`
  );

  // NAND Gate convergence test
  const nandTrainer = new Trainer({ gateId: 'NAND', learningRate: 0.1, maxEpochs: 30 });
  nandTrainer.fastForward();
  const nandEval = nandTrainer.perceptron.evaluate(GATES.NAND.table);
  assert(
    'Convergence: NAND Gate converges with 100% accuracy (4/4)',
    nandTrainer.state === TrainerState.CONVERGED && nandEval.isConverged && nandEval.accuracy === 1.0,
    `Epochs=${nandTrainer.currentEpoch}, Accuracy=${nandEval.accuracy}, Errors=${nandEval.errorCount}`
  );

  // --- Suite 5: XOR Non-Separability Limitation ---
  const xorTrainer = new Trainer({ gateId: 'XOR', learningRate: 0.1, maxEpochs: 30 });
  xorTrainer.fastForward();
  const xorEval = xorTrainer.perceptron.evaluate(GATES.XOR.table);
  assert(
    'Limitation Verification: XOR Gate reaches MAX_EPOCHS and does NOT converge to 100%',
    xorTrainer.state === TrainerState.MAX_EPOCHS &&
    !xorEval.isConverged &&
    xorEval.accuracy < 1.0,
    `State=${xorTrainer.state}, Accuracy=${xorEval.accuracy}, Errors=${xorEval.errorCount}`
  );

  // --- Suite 6: State Reset & Determinism ---
  andTrainer.reset();
  const resetEval = andTrainer.perceptron.evaluate(GATES.AND.table);
  assert(
    'Reset integrity: Trainer reset restores epoch 0, sample index 0, and default weights',
    andTrainer.currentEpoch === 0 &&
    andTrainer.sampleIndex === 0 &&
    andTrainer.state === TrainerState.IDLE &&
    andTrainer.perceptron.w1 === 0 &&
    andTrainer.perceptron.w2 === 0 &&
    andTrainer.perceptron.b === 0,
    `Epoch=${andTrainer.currentEpoch}, w1=${andTrainer.perceptron.w1}, b=${andTrainer.perceptron.b}`
  );

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    allPassed: failedCount === 0,
    results
  };
}

// Auto-run when executed in Node environment
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('tests.js')) {
  const summary = runAllTests();
  console.log('====================================');
  console.log(`Perceptron Lab Unit Tests: ${summary.passed}/${summary.total} PASSED`);
  console.log('====================================');
  for (const r of summary.results) {
    const symbol = r.passed ? '✓' : '✗';
    console.log(`${symbol} ${r.name}`);
    if (!r.passed) console.log(`   ${r.details}`);
  }
  if (!summary.allPassed) {
    process.exit(1);
  }
}
