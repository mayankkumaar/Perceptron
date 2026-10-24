export interface PerceptronCalculation {
  x1: number;
  x2: number;
  w1: number;
  w2: number;
  bias: number;
  w1x1: number;
  w2x2: number;
  z: number; // weighted sum
  y: number; // step activation: 1 or 0
  active: boolean;
  formulaString: string;
  stepExplanation: string;
}

/**
 * Computes single-neuron perceptron prediction using:
 * z = w1*x1 + w2*x2 + b
 * y = 1 if z >= 0 else 0
 */
export function computePerceptron(
  x1: number,
  x2: number,
  w1: number = 1.0,
  w2: number = 1.0,
  bias: number = -0.5
): PerceptronCalculation {
  const w1x1 = Number((w1 * x1).toFixed(3));
  const w2x2 = Number((w2 * x2).toFixed(3));
  const z = Number((w1x1 + w2x2 + bias).toFixed(3));
  const y = z >= 0 ? 1 : 0;
  const active = y === 1;

  const biasSign = bias >= 0 ? `+ ${bias}` : `- ${Math.abs(bias)}`;
  const formulaString = `z = (${w1} × ${x1}) + (${w2} × ${x2}) ${biasSign} = ${z}`;
  
  let stepExplanation = '';
  if (z >= 0) {
    stepExplanation = `z = ${z} ≥ 0  ⟹  Activation Threshold Met  ⟹  Y = 1 (WARNING ON)`;
  } else {
    stepExplanation = `z = ${z} < 0  ⟹  Activation Threshold Not Met  ⟹  Y = 0 (SAFE / STANDBY)`;
  }

  return {
    x1,
    x2,
    w1,
    w2,
    bias,
    w1x1,
    w2x2,
    z,
    y,
    active,
    formulaString,
    stepExplanation,
  };
}

/**
 * OR Truth Table combinations:
 * [X1, X2, Expected_OR]
 */
export const OR_TRUTH_TABLE = [
  { x1: 0, x2: 0, expected: 0, scenario: 'No Obstacle Detected in Zone 1 or Zone 2' },
  { x1: 0, x2: 1, expected: 1, scenario: 'Critical Proximity Detected in Zone 2' },
  { x1: 1, x2: 0, expected: 1, scenario: 'General Obstacle Detected in Zone 1' },
  { x1: 1, x2: 1, expected: 1, scenario: 'Both Ultrasonic Zones Triggered' },
];

/**
 * Gate Presets for Educational Comparison
 */
export const GATE_PRESETS = {
  OR: {
    name: 'OR (Parking Warning)',
    w1: 1.0,
    w2: 1.0,
    bias: -0.5,
    symbol: '∨',
    expression: 'Y = X₁ + X₂',
    separable: true,
    description: 'Outputs 1 if either Sensor 1 OR Sensor 2 detects an obstacle. Ideal for fail-safe safety warning.',
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 1 },
    ],
  },
  AND: {
    name: 'AND (Double Confirmation)',
    w1: 1.0,
    w2: 1.0,
    bias: -1.5,
    symbol: '∧',
    expression: 'Y = X₁ · X₂',
    separable: true,
    description: 'Outputs 1 ONLY when BOTH sensors simultaneously confirm detection.',
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 0 },
      { x1: 1, x2: 0, y: 0 },
      { x1: 1, x2: 1, y: 1 },
    ],
  },
  NAND: {
    name: 'NAND (Negative AND)',
    w1: -1.0,
    w2: -1.0,
    bias: 1.5,
    symbol: '⊼',
    expression: 'Y = ¬(X₁ · X₂)',
    separable: true,
    description: 'Universal logic gate; outputs 0 only when both inputs are 1.',
    table: [
      { x1: 0, x2: 0, y: 1 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 0 },
    ],
  },
  NOR: {
    name: 'NOR (Negative OR)',
    w1: -1.0,
    w2: -1.0,
    bias: 0.5,
    symbol: '⊽',
    expression: 'Y = ¬(X₁ + X₂)',
    separable: true,
    description: 'Outputs 1 only when neither sensor detects an obstacle (All-Clear signal).',
    table: [
      { x1: 0, x2: 0, y: 1 },
      { x1: 0, x2: 1, y: 0 },
      { x1: 1, x2: 0, y: 0 },
      { x1: 1, x2: 1, y: 0 },
    ],
  },
  XOR: {
    name: 'XOR (Exclusive OR)',
    w1: 1.0,
    w2: 1.0,
    bias: -0.5,
    symbol: '⊕',
    expression: 'Y = X₁ ⊕ X₂',
    separable: false,
    description: 'Outputs 1 if inputs differ. CANNOT be separated by a single linear decision boundary (requires MLP).',
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 0 },
    ],
  },
};

/**
 * Calculates decision boundary points for 2D plot:
 * w1*x1 + w2*x2 + b = 0
 * x2 = (-w1*x1 - b) / w2
 */
export function getDecisionBoundaryPoints(
  w1: number,
  w2: number,
  bias: number,
  xMin = -0.3,
  xMax = 1.3
) {
  if (Math.abs(w2) < 0.0001) {
    // Vertical line: x1 = -bias / w1
    const xVal = w1 !== 0 ? -bias / w1 : 0;
    return [
      { x1: xVal, x2: -0.3 },
      { x1: xVal, x2: 1.3 },
    ];
  }

  const yAtXMin = (-w1 * xMin - bias) / w2;
  const yAtXMax = (-w1 * xMax - bias) / w2;

  return [
    { x1: xMin, x2: yAtXMin },
    { x1: xMax, x2: yAtXMax },
  ];
}
