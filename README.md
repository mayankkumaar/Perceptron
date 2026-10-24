# Smart Parking Assistant
## Interactive Car Parking Simulator Powered by a Single-Neuron Perceptron (OR Gate)

An interactive, educational automotive engineering application combining a playable 3D vehicle parking game with a mathematically accurate Single-Neuron Perceptron implementing an OR logic gate for real-time obstacle detection and collision warning.

---

## 1. Project Overview

The **Smart Parking Assistant** demonstrates how fundamental artificial intelligence principles operate inside automotive Advanced Driver Assistance Systems (ADAS). Rather than relying on static formulas or videos, this project simulates:
- **Dual Ultrasonic Radar Sensors**: Time-of-Flight (ToF) echo ranging mounted at the rear bumper.
- **Binary Signal Quantization**: Converts physical distances into binary feature inputs ($X_1, X_2$).
- **Single-Neuron Perceptron**: Computes algebraic affine transformations $z = w_1 x_1 + w_2 x_2 + b$ and evaluates the Heaviside step activation $Y = H(z)$.
- **Auditory & Visual Hazard Warnings**: Synthesizes multi-cadence audio beeps via the Web Audio API alongside cockpit warning indicators.
- **3D Vehicle Physics Simulation**: A playable car parking game with authentic kinematic bicycle physics, multiple levels, and collision detection.

---

## 2. Technology Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript (strict mode)
- **3D Graphics**: Three.js (WebGL procedural car, dynamic shadows, headlights, and sonar waves)
- **Styling**: Tailwind CSS (dark automotive dashboard glassmorphism)
- **Animations**: Framer Motion
- **State Management**: Zustand (high-performance 60 FPS unified store)
- **Audio Synthesis**: Web Audio API (procedural engine hum, ultrasonic warning beeps, and collision effects)
- **Icons**: Lucide React
- **Celebrations**: Canvas Confetti

---

## 3. Application Structure

The web application contains 8 comprehensive navigation sections:

1. **Overview**: Executive summary, live KPI telemetry (speed, gear, distances, perceptron state), and animated system architecture pipeline.
2. **Parking Simulator**: Fully playable 3D car parking game across 3 difficulty levels (Basic, Narrow Bay, Challenge Mode with moving obstacles).
3. **Perceptron Lab**: Interactive artificial neuron diagram with live signal pulses, synaptic weight/bias sliders, and step-by-step arithmetic.
4. **Sensor Laboratory**: Ultrasonic radar oscilloscope, Time-of-Flight transit time calculation, configurable distance thresholds, and manual test probes.
5. **Logic Gate Explorer**: Comparative analysis of OR, AND, NOT, NAND, NOR, and XOR gates with linear separability proofs (Minsky & Papert 1969).
6. **Mathematical Model**: Formal derivation of the dot product, affine summation, Heaviside step function, and 2D decision hyperplane geometry.
7. **Testing & Results**: Automated 4-test case unit verification suite for the OR truth table with 100% pass verification, alongside empirical driving analytics.
8. **Project Documentation**: Complete 20-section academic and industrial engineering report.

---

## 4. Mathematical Model

### Feedforward Inference Equation
$$z = \mathbf{w}^T \mathbf{x} + b = (w_1 \cdot x_1) + (w_2 \cdot x_2) + b$$

$$Y = H(z) = \begin{cases} 1 & \text{if } z \ge 0 \quad (\text{Obstacle Detected — Warning Active}) \\ 0 & \text{if } z < 0 \quad (\text{Safe Clearance — System Standby}) \end{cases}$$

### Calibrated Parameters for OR Logic
- $w_1 = 1.0$ (Synaptic weight for Sensor 1 / General Zone)
- $w_2 = 1.0$ (Synaptic weight for Sensor 2 / Critical Zone)
- $b = -0.5$ (Threshold activation bias)

### Truth Table
| $X_1$ (Zone 1 ≤ 100cm) | $X_2$ (Zone 2 ≤ 30cm) | Weighted Sum $z$ | Output $Y = H(z)$ | Safety Verdict |
| :---: | :---: | :---: | :---: | :--- |
| **0** | **0** | $(1 \cdot 0) + (1 \cdot 0) - 0.5 = \mathbf{-0.5}$ | **0** | **Safe / Standby** |
| **0** | **1** | $(1 \cdot 0) + (1 \cdot 1) - 0.5 = \mathbf{+0.5}$ | **1** | **Hazard Warning** |
| **1** | **0** | $(1 \cdot 1) + (1 \cdot 0) - 0.5 = \mathbf{+0.5}$ | **1** | **Hazard Warning** |
| **1** | **1** | $(1 \cdot 1) + (1 \cdot 1) - 0.5 = \mathbf{+1.5}$ | **1** | **Hazard Warning** |

### Decision Boundary Hyperplane
$$w_1 x_1 + w_2 x_2 + b = 0 \implies x_2 = -x_1 + 0.5$$

---

## 5. Controls

- **W / Up Arrow**: Drive Forward
- **S / Down Arrow**: Reverse (activates white reverse LEDs and rear ultrasonic sensors)
- **A / Left Arrow**: Steer Left
- **D / Right Arrow**: Steer Right
- **Spacebar**: Emergency Disc Brake
- **R**: Reset Car to Starting Position
- **P**: Pause / Resume Simulation
- **On-Screen Touch Controls**: Dedicated steering buttons and drive/reverse/brake pedals are provided on-screen for mobile and tablet users.

---

## 6. Installation and Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/mayankkumaar/Perceptron.git
cd Perceptron

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser at `http://localhost:3000/`.

### Production Build & GitHub Pages Deployment
```bash
npm run build
```
The compiled output is located in the `dist/` directory and can be deployed directly to GitHub Pages, Vercel, or any static host.
