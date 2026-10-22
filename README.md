# Perceptron Lab: Interactive Binary Logic Gate Learning

An interactive, scientifically rigorous educational web application demonstrating how a single artificial neuron learns binary logic gates from first principles.

---

## 1. Project Overview

**Perceptron Lab** is a browser-native educational platform designed to bridge the gap between abstract mathematical formulas and the tangible mechanics of machine learning. By modeling Frank Rosenblatt's classic 1957 Perceptron algorithm from scratch, the application demystifies how a single-neuron threshold logic unit (TLU) iteratively adjusts connection weights and bias to linearly separate binary logic spaces.

The laboratory provides live, synchronized visualizations of:
1. **The Animated Perceptron Centerpiece**: Signal propagation through weighted synapses, summation ($\sum$), Heaviside step activation ($\Theta$), error calculation ($e = y - \hat{y}$), and gradient-free weight delta updates.
2. **2D Decision Boundary Space**: Real-time rendering of the hyperplane ($w_1 x_1 + w_2 x_2 + b = 0$), classification half-planes, normal vector orientation, and data point correctness.
3. **Training History Analytics**: Loss (misclassification count) and accuracy trajectories over training epochs.
4. **Interactive Truth Table**: Synchronized sample-by-sample tracking and inspection.
5. **Manual Prediction Playground**: Real-time inference simulator for testing arbitrary binary inputs and applying isolated single-step updates.
6. **The XOR Limitation**: Rigorous mathematical and geometric demonstration of why a single linear threshold unit cannot separate non-linear spaces.

Every visualization is strictly driven by the real underlying mathematical state of the algorithm—**no pre-baked animations, decorative mockups, or fabricated convergence curves**.

---

## 2. Learning Objectives

By interacting with Perceptron Lab, students, researchers, and engineers will understand:
- **Biological to Artificial Neuron Mapping**: How biological dendrites, soma, and axons correspond to input vectors ($X$), synaptic weights ($W$), summation/activation, and output signals ($\hat{y}$).
- **Forward Pass Computation**: Calculating net input $z = \sum_{i=1}^n w_i x_i + b$ and applying a discontinuous step threshold.
- **The Perceptron Learning Rule**: The mathematical mechanics of supervised error correction: $\Delta w_i = \eta (y - \hat{y}) x_i$ and $\Delta b = \eta (y - \hat{y})$.
- **Geometric Interpretation of Weights and Bias**:
  - The weight vector $\mathbf{w} = [w_1, w_2]^T$ acts as the normal vector perpendicular to the decision hyperplane.
  - The bias $b$ acts as an offset determining the perpendicular distance of the boundary from the origin.
- **The Perceptron Convergence Theorem (Novikoff, 1962)**: Proof that if training data is linearly separable, the perceptron learning rule is guaranteed to find a separating hyperplane in a finite number of steps.
- **Linear Separability & The Minsky-Papert Critique (1969)**: Algebraic proof of why a single perceptron fails on XOR ($x_1 \oplus x_2$), triggering the historical "First AI Winter" and underscoring the necessity of multi-layer perceptrons (MLPs) and non-linear activation functions.

---

## 3. Technology Stack & Architecture

Built with zero external framework overhead, external ML libraries, or remote servers:

- **Structure**: Semantic HTML5 with accessible ARIA landmarks.
- **Styling**: Vanilla CSS3 using a custom scientific design system (CSS custom properties, dark slate laboratory palette, responsive CSS Grid and Flexbox).
- **Application & Model Logic**: Modular Vanilla JavaScript (ES2022 Modules).
- **Centerpiece Visualizer**: Scalable Vector Graphics (SVG) with programmatic path interpolation, synchronized signal propagation, and mathematical callouts.
- **Boundary & Progress Analytics**: High-DPI HTML5 Canvas rendering for sub-millisecond redraws without external charting libraries.
- **Hosting**: 100% client-side execution; fully compatible with GitHub Pages or any static HTTP server.

```
perceptron-lab/
├── index.html              # Main application shell and layout
├── assets/
│   └── favicon.svg         # Scientific vector icon
├── css/
│   ├── tokens.css          # Design system tokens (palette, typography, elevations)
│   ├── layout.css          # Workspace grid, ribbon, header, and card layouts
│   ├── components.css      # Buttons, tables, sliders, metrics, playground, modals
│   ├── neuron-viz.css      # SVG vector styling and live equation breakdown bar
│   └── responsive.css      # Viewport media queries for desktop, tablet, and mobile
├── js/
│   ├── gates.js            # Truth table schemas, boolean expressions, and separability metadata
│   ├── perceptron.js       # Pure mathematical model (forward pass, Rosenblatt update, metrics)
│   ├── trainer.js          # State machine, epoch scheduler, event bus, convergence engine
│   ├── neuron-viz.js       # SVG signal packet animation, node states, equation updates
│   ├── boundary-viz.js     # 2D canvas boundary line, normal vector, half-plane shading
│   ├── history-chart.js    # Canvas epoch error and accuracy curve visualizer
│   ├── tests.js            # Automated unit test suite (runs in CLI and browser modal)
│   └── app.js              # Central orchestrator binding models, visualizers, and UI
└── README.md               # Complete scientific and engineering documentation
```

---

## 4. Mathematical Foundations

### 4.1 Forward Pass Formulation

Given a binary input vector $\mathbf{x} = [x_1, x_2]^T \in \{0, 1\}^2$, synaptic weights $\mathbf{w} = [w_1, w_2]^T \in \mathbb{R}^2$, and scalar bias $b \in \mathbb{R}$:

$$\text{Net Input (Weighted Sum): } \quad z = \mathbf{w}^T \mathbf{x} + b = w_1 x_1 + w_2 x_2 + b$$

The predicted class $\hat{y} \in \{0, 1\}$ is determined by the Heaviside step activation function with threshold at $0$:

$$\hat{y} = \Theta(z) = \begin{cases} 1, & \text{if } z \ge 0 \\ 0, & \text{if } z < 0 \end{cases}$$

### 4.2 Supervised Error & Rosenblatt Update Rule

For each training example with true target label $y \in \{0, 1\}$, the prediction error $e$ is:

$$e = y - \hat{y} \in \{-1, 0, +1\}$$

When $e = 0$, the prediction matches the target, and parameters remain unchanged ($\Delta \mathbf{w} = \mathbf{0}, \Delta b = 0$).

When $e \ne 0$, parameters are updated using stochastic gradient descent on the perceptron criterion with learning rate $\eta \in (0, 1]$:

$$\Delta w_i = \eta \cdot e \cdot x_i = \eta (y - \hat{y}) x_i \quad \text{for } i \in \{1, 2\}$$

$$\Delta b = \eta \cdot e = \eta (y - \hat{y})$$

The new parameter state is computed:

$$w_1^{(t+1)} \leftarrow w_1^{(t)} + \Delta w_1$$

$$w_2^{(t+1)} \leftarrow w_2^{(t)} + \Delta w_2$$

$$b^{(t+1)} \leftarrow b^{(t)} + \Delta b$$

### 4.3 Geometric Representation of the Decision Hyperplane

The classification boundary corresponds to the locus of points where the net input is zero:

$$w_1 x_1 + w_2 x_2 + b = 0$$

- **General Case ($w_2 \ne 0$)**: The boundary is a line in the $x_1$-$x_2$ plane:
  $$x_2 = -\frac{w_1}{w_2} x_1 - \frac{b}{w_2}$$
  - Slope: $m = -\frac{w_1}{w_2}$
  - Vertical intercept: $c = -\frac{b}{w_2}$
- **Vertical Line ($w_2 = 0, w_1 \ne 0$)**:
  $$x_1 = -\frac{b}{w_1}$$
- **Horizontal Line ($w_1 = 0, w_2 \ne 0$)**:
  $$x_2 = -\frac{b}{w_2}$$
- **Zero Weights ($w_1 = 0, w_2 = 0$)**: No line exists. The entire plane evaluates uniformly to $z = b$. If $b \ge 0$, all points are classified as $1$; otherwise all are $0$.
- **Normal Vector**: The vector $\mathbf{w} = [w_1, w_2]^T$ is orthogonal to the boundary line and points directly toward the half-plane classified as $1$ ($z \ge 0$).

---

## 5. Logic Gate Truth Tables & Separability

| Input $x_1$ | Input $x_2$ | AND Target | OR Target | NAND Target | XOR Target |
|:-----------:|:-----------:|:----------:|:---------:|:-----------:|:----------:|
| $0$ | $0$ | $0$ | $0$ | $1$ | $0$ |
| $0$ | $1$ | $0$ | $1$ | $1$ | $1$ |
| $1$ | $0$ | $0$ | $1$ | $1$ | $1$ |
| $1$ | $1$ | $1$ | $1$ | $0$ | $0$ |

### 5.1 AND Gate (Linearly Separable)
- **Condition**: $y = 1 \iff x_1 = 1 \land x_2 = 1$.
- **Sample Converged Hyperplane**: $w_1 = 0.20, w_2 = 0.20, b = -0.30$.
  - $(0,0): z = -0.30 < 0 \implies \hat{y} = 0$ (Correct)
  - $(0,1): z = -0.10 < 0 \implies \hat{y} = 0$ (Correct)
  - $(1,0): z = -0.10 < 0 \implies \hat{y} = 0$ (Correct)
  - $(1,1): z = +0.10 \ge 0 \implies \hat{y} = 1$ (Correct)
- **Convergence**: Guaranteed in $\le 10$ epochs with $\eta = 0.1$.

### 5.2 OR Gate (Linearly Separable)
- **Condition**: $y = 1 \iff x_1 = 1 \lor x_2 = 1$.
- **Sample Converged Hyperplane**: $w_1 = 0.20, w_2 = 0.20, b = -0.10$.
  - $(0,0): z = -0.10 < 0 \implies \hat{y} = 0$ (Correct)
  - $(0,1): z = +0.10 \ge 0 \implies \hat{y} = 1$ (Correct)
  - $(1,0): z = +0.10 \ge 0 \implies \hat{y} = 1$ (Correct)
  - $(1,1): z = +0.30 \ge 0 \implies \hat{y} = 1$ (Correct)
- **Convergence**: Guaranteed in $\le 5$ epochs with $\eta = 0.1$.

### 5.3 NAND Gate (Linearly Separable)
- **Condition**: $y = 0 \iff x_1 = 1 \land x_2 = 1$.
- **Sample Converged Hyperplane**: $w_1 = -0.20, w_2 = -0.20, b = +0.30$.
  - Perfect dual reflection of the AND gate hyperplane.
- **Convergence**: Guaranteed in $\le 10$ epochs with $\eta = 0.1$.

### 5.4 The XOR Problem: Algebraic Proof of Non-Separability

To satisfy the XOR logic gate, a single perceptron would require real coefficients $w_1, w_2, b \in \mathbb{R}$ such that:

1. For input $(0,0) \to y = 0$:
   $$w_1(0) + w_2(0) + b < 0 \implies \mathbf{b < 0}$$
2. For input $(0,1) \to y = 1$:
   $$w_1(0) + w_2(1) + b \ge 0 \implies \mathbf{w_2 + b \ge 0}$$
3. For input $(1,0) \to y = 1$:
   $$w_1(1) + w_2(0) + b \ge 0 \implies \mathbf{w_1 + b \ge 0}$$
4. For input $(1,1) \to y = 0$:
   $$w_1(1) + w_2(1) + b < 0 \implies \mathbf{w_1 + w_2 + b < 0}$$

Summing inequalities (2) and (3):
$$(w_2 + b) + (w_1 + b) \ge 0 \implies w_1 + w_2 + 2b \ge 0 \implies \mathbf{w_1 + w_2 \ge -2b}$$

From inequality (4):
$$w_1 + w_2 + b < 0 \implies \mathbf{w_1 + w_2 < -b}$$

Combining the two bounds on $(w_1 + w_2)$:
$$-2b \le w_1 + w_2 < -b \implies -2b < -b \implies \mathbf{b > 0}$$

However, inequality (1) mandates that $\mathbf{b < 0}$. Because $b < 0$ and $b > 0$ are contradictory, **no straight line in $\mathbb{R}^2$ can separate XOR**.

In Perceptron Lab, when XOR is trained, users witness the decision line oscillating continuously, failing to reach 100% accuracy, and terminating cleanly at `MAX_EPOCHS_REACHED` with an explicit mathematical explanation.

---

## 6. Application Features & Working

### 6.1 Logic Gate Selector Ribbon
- Instant switching between **AND**, **OR**, **NAND**, and **XOR**.
- Updates the active truth table, expected targets, boolean algebraic notation, and linear separability diagnostic banner.
- Cancels active asynchronous training timers to prevent memory leaks or competing execution threads.

### 6.2 Centerpiece Animated Perceptron (SVG)
- Vector rendering with high-definition styling.
- **Inputs**: $x_1$ and $x_2$ nodes with active/inactive fill indicators.
- **Synapses**: Real-time weight badges displaying $w_1$ and $w_2$, accompanied by dynamic product annotations ($x_1 \cdot w_1$ and $x_2 \cdot w_2$).
- **Bias**: Explicit $+1$ bias node and synaptic connection with dynamic bias badge $b$.
- **Neuron Body**: Dual-compartment anatomy:
  - Left lobe: Summation $\sum$ displaying calculated scalar $z$.
  - Right lobe: Activation $\Theta(z)$ displaying step threshold condition.
- **Output Node**: Prediction $\hat{y} \in \{0, 1\}$ with adjacent target badge and error badge.
- **Synchronized 3-Phase Animation**:
  1. *Propagation Phase*: Traveling glowing signal packets traverse paths toward the neuron.
  2. *Summation & Activation Phase*: Neuron calculates $z$ and emits $\hat{y}$ to the output node.
  3. *Error & Delta Phase*: Prediction is checked against target. If $e \ne 0$, error glows red, and weight updates ($\Delta w_1, \Delta w_2, \Delta b$) flash in green/red at their connections.
- **Equation Breakdown Bar**: Step-by-step arithmetic equations updating synchronously beneath the SVG.

### 6.3 2D Decision Boundary Space (Canvas)
- Coordinate viewport encompassing $[-0.35, 1.35] \times [-0.35, 1.35]$.
- Background half-plane raster shading: Blue/cyan for $z \ge 0$ (Class 1) and dark navy for $z < 0$ (Class 0).
- Decision line ($w_1 x_1 + w_2 x_2 + b = 0$) drawn with robust clipping for vertical ($w_2 = 0$), horizontal ($w_1 = 0$), and zero-weight states.
- Normal vector $\mathbf{w}$ indicating positive hyperplane orientation.
- Data points plotted with dual indicators:
  - Center: True target class ($1$ = solid emerald, $0$ = dark slate).
  - Ring halo: Model classification correctness (green check = correct, red exclamation = misclassified).
  - Concentric pulse: Current active training sample.
- **Interactive Mouse Inspection**: Moving the cursor across the plane reveals the exact coordinates, computed $z$, and predicted class in real time.

### 6.4 Training History Analytics (Canvas)
- Dual-mode progress visualization:
  - **Performance View**: Misclassifications per epoch ($0$ to $4$) plotted alongside Accuracy ($0\%$ to $100\%$).
  - **Weights Evolution View**: Trajectory curves for $w_1$, $w_2$, and $b$ across epochs.
- Interactive hover tooltips showing exact epoch metrics.

### 6.5 Interactive Truth Table
- 4 rows showing $(0,0), (0,1), (1,0), (1,1)$.
- Highlights the current training sample during training.
- Inspect button on each row loads that input combination into the Manual Playground.

### 6.6 Manual Prediction Playground
- Toggle buttons for $x_1 \in \{0, 1\}$ and $x_2 \in \{0, 1\}$.
- Computes real-time inference using current weights without altering model state.
- **"Train On This Sample"** button applies a single SGD update on that isolated sample and immediately visualizes the parameter delta.

### 6.7 Training Controls & State Machine
- **Start / Pause / Resume**: Non-blocking asynchronous training scheduler.
- **Train One Step**: Processes exactly one example and renders its state snapshot.
- **Train One Epoch**: Executes all 4 truth table examples in sequence.
- **Fast Forward**: Synchronously trains to convergence or max epochs instantly.
- **Reset**: Re-initializes model parameters to baseline state.
- **Randomize Weights**: Assigns small pseudo-random weights with reproducible LCG seeds.
- **Speed Slider**: Controls animation delay from $0.5\times$ ($2200\,\text{ms}$) to $5.0\times$ ($150\,\text{ms}$).
- **Learning Rate Slider ($\eta$)**: Adjusts step size in range $[0.05, 1.0]$.
- **Max Epochs Slider**: Sets termination threshold in range $[5, 100]$.
- **Reduced Motion Mode**: Instantly updates visuals for accessibility or rapid training.

### 6.8 Automated Unit Test Runner
- Built-in test suite executing 12 rigorous assertions directly in the browser via a modal dialog or from the command line.

---

## 7. Installation & Local Development

Perceptron Lab requires no external dependencies, compiler toolchains, or package managers.

### Option A: Direct Browser Execution
Simply open `index.html` in any modern web browser:
```bash
# On Windows PowerShell
Start-Process index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

### Option B: Local Development Server (Recommended for ES Modules)
To ensure smooth browser module resolution, run a lightweight local static server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx http-server)
npx http-server -p 8000 -c-1

# Using Node.js (npx serve)
npx serve -l 8000 .
```
Then navigate to `http://localhost:8000` in your browser.

---

### Option C: Node Backend (Recommended)

The project also includes a zero-dependency Node.js backend. It serves the static application and exposes JSON endpoints for predictions and server-side training.

```bash
node server.js
# or
npm start
```

The default address is `http://localhost:8000`. Use `--port` or `PERCEPTRON_PORT` to select another port.

#### API Endpoints

- `GET /api/health` — backend health check.
- `GET /api/gates` — gate metadata and truth tables.
- `POST /api/predict` — predict one sample with optional `{ gateId, x1, x2, weights, learningRate }`.
- `POST /api/train` — train to convergence or the epoch limit with optional `{ gateId, learningRate, maxEpochs, weights }`.
- `POST /api/train/step` — apply one Rosenblatt update to `{ gateId, x1, x2, weights, learningRate }`.

Example:

```bash
curl -X POST http://localhost:8000/api/train `
  -H "Content-Type: application/json" `
  -d '{"gateId":"AND","learningRate":0.1,"maxEpochs":30}'
```

The API validates gate IDs, binary inputs, numeric parameters, request size, and static file paths. It has no external runtime dependencies.

---
## 8. Deployment via GitHub Pages

The repository is ready for GitHub Pages. The site is static and starts at the root `index.html`; the Node backend is for local/API use only because GitHub Pages does not run server processes.

A GitHub Actions workflow in `.github/workflows/deploy-pages.yml` deploys the root directory whenever `main` changes.

1. Open **Settings > Pages** in the GitHub repository.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the **Deploy Perceptron Lab to GitHub Pages** workflow manually.
4. After the workflow completes, open:
   `https://mayankkumaar.github.io/Perceptron/`

The `.nojekyll` marker keeps GitHub Pages from applying Jekyll processing to the static asset tree.
### Firebase Hosting

The repository is also configured for the Firebase project `binaryperceptron` (display name: **Perceptron**). Firebase Hosting publishes the static frontend from the repository root; the Node backend is not deployed there.

```bash
firebase deploy --only hosting --project binaryperceptron
```

Live site: `https://binaryperceptron.web.app`


---
## 9. Verification & Unit Testing

The repository includes a standalone test suite in `js/tests.js` verifying mathematical invariants:

### 9.1 Running Tests from Command Line (Node.js)
```bash
node js/tests.js
```

**Expected Output:**
```
====================================
Perceptron Lab Unit Tests: 12/12 PASSED
====================================
✓ Step activation: Θ(0) = 1 (threshold test)
✓ Step activation: Θ(0.001) = 1
✓ Step activation: Θ(-0.001) = 0
✓ Forward pass: predict(1,1) with w=[0.5, -0.2], b=-0.1 -> z=0.2, yHat=1
✓ Forward pass: predict(0,1) with w=[0.5, -0.2], b=-0.1 -> z=-0.3, yHat=0
✓ Rosenblatt Update: Sample (0,0) target 0 -> b changes from 0 to -0.1
✓ Rosenblatt Update: Sample (1,1) target 1 -> w1=0.1, w2=0.1, b=0.0
✓ Convergence: AND Gate converges with 100% accuracy (4/4)
✓ Convergence: OR Gate converges with 100% accuracy (4/4)
✓ Convergence: NAND Gate converges with 100% accuracy (4/4)
✓ Limitation Verification: XOR Gate reaches MAX_EPOCHS and does NOT converge to 100%
✓ Reset integrity: Trainer reset restores epoch 0, sample index 0, and default weights
```

### 9.2 Running Tests in the Browser
Click the **"Run Unit Tests"** button in the application header. A modal executes the full test suite in real time and renders pass/fail badges with execution diagnostics.

---

## 10. Design Philosophy & Visual Art Direction

Perceptron Lab strictly adheres to a **scientific laboratory design aesthetic**:
- **Palette**: Solid deep slate and dark ink surfaces (`#080c14`, `#0e1526`) with crisp borders (`#1e293b`).
- **Restrained Accents**: Precision cyan (`#38bdf8`) for active synapses and signals; emerald (`#10b981`) for correct classifications; coral/rose (`#f43f5e`) for prediction errors; amber (`#f59e0b`) for bias and normal vectors.
- **Typography**: Inter for interface elements paired with JetBrains Mono for matrices, parameters, and equations.
- **Purposeful Motion**: Every animation corresponds directly to an algorithmic step (data propagation, summation, step activation, error evaluation, parameter delta). No gratuitous looping particles or decorative distractions.

---

## 11. Future Extensions

Potential extensions for advanced coursework or academic projects:
- **Continuous Activations**: Interactive comparison with Sigmoid ($\sigma(z)$) and ReLU ($\max(0, z)$) activation functions.
- **Multi-Layer Perceptron (MLP)**: Introducing a hidden layer with 2 neurons to resolve the XOR problem via composite hyperplanes.
- **Loss Landscapes**: 3D surface plot visualizing the loss function $L(w_1, w_2)$ as weights navigate the parameter space.
- **Continuous 2D Data**: Allowing arbitrary continuous 2D point clouds with draggable sample points.

---

## 12. Conclusion & Academic Summary

Perceptron Lab delivers an uncompromising, mathematically authentic demonstration of early neural network theory. By grounding abstract algebraic proofs in an intuitive, responsive, and art-directed visual medium, it serves as an ideal pedagogical instrument for computer science and artificial intelligence curricula—proving that even the simplest artificial neuron reveals the fundamental principles and boundaries of machine learning.
