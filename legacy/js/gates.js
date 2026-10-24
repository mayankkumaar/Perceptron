/**
 * Logic Gate Definitions for Perceptron Lab
 * Contains truth tables, descriptions, mathematical linear separability classifications,
 * and educational explanations for each logic gate.
 */

export const GATES = {
  AND: {
    id: 'AND',
    name: 'AND Gate',
    symbol: '∧',
    booleanExpr: 'y = x₁ · x₂',
    isLinearlySeparable: true,
    description: 'Outputs 1 if and only if both inputs x₁ and x₂ are 1. Readily separable by a single linear hyperplane.',
    separableExplanation: 'Linearly separable: A line such as x₁ + x₂ = 1.5 cleanly separates (1,1) from {(0,0), (0,1), (1,0)}.',
    defaultWeights: { w1: 0.0, w2: 0.0, b: 0.0 },
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 0 },
      { x1: 1, x2: 0, y: 0 },
      { x1: 1, x2: 1, y: 1 }
    ]
  },
  OR: {
    id: 'OR',
    name: 'OR Gate',
    symbol: '∨',
    booleanExpr: 'y = x₁ + x₂',
    isLinearlySeparable: true,
    description: 'Outputs 1 if at least one input is 1. Readily separable by a single linear hyperplane.',
    separableExplanation: 'Linearly separable: A line such as x₁ + x₂ = 0.5 cleanly separates (0,0) from {(0,1), (1,0), (1,1)}.',
    defaultWeights: { w1: 0.0, w2: 0.0, b: 0.0 },
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 1 }
    ]
  },
  NAND: {
    id: 'NAND',
    name: 'NAND Gate',
    symbol: '⊼',
    booleanExpr: 'y = ¬(x₁ · x₂)',
    isLinearlySeparable: true,
    description: 'Universal logic gate: Outputs 0 if and only if both inputs are 1. The inverted dual of the AND gate.',
    separableExplanation: 'Linearly separable: A line such as -x₁ - x₂ = -1.5 cleanly separates (1,1) from the other three points.',
    defaultWeights: { w1: 0.0, w2: 0.0, b: 0.0 },
    table: [
      { x1: 0, x2: 0, y: 1 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 0 }
    ]
  },
  XOR: {
    id: 'XOR',
    name: 'XOR Gate',
    symbol: '⊕',
    booleanExpr: 'y = x₁ ⊕ x₂',
    isLinearlySeparable: false,
    description: 'Exclusive OR: Outputs 1 if exactly one input is 1, and 0 if both are 0 or both are 1. Cannot be learned by a single perceptron.',
    separableExplanation: 'NOT linearly separable: The points (0,1) and (1,0) lie on opposite diagonal vertices from (0,0) and (1,1). No single straight line can partition these two sets.',
    defaultWeights: { w1: 0.0, w2: 0.0, b: 0.0 },
    table: [
      { x1: 0, x2: 0, y: 0 },
      { x1: 0, x2: 1, y: 1 },
      { x1: 1, x2: 0, y: 1 },
      { x1: 1, x2: 1, y: 0 }
    ]
  }
};
