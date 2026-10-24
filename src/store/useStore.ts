import { create } from 'zustand';
import {
  PageId,
  VehicleState,
  SensorData,
  PerceptronState,
  GameMetrics,
  SoundConfig,
  CameraMode,
  ThemeMode,
} from '../types';
import { LEVELS } from '../game/levels';
import { CAR_CONFIG, updateVehiclePhysics, evaluateParking, VehicleInputs } from '../game/physics';
import { testVehicleCollision, castSensorRay } from '../game/collision';
import { computePerceptron } from '../perceptron/model';
import { soundManager } from '../audio/soundManager';

interface SimulationStore {
  // Theme & Views
  theme: ThemeMode;
  toggleTheme: () => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;

  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Level & Game State
  currentLevelIndex: number;
  gameStatus: 'playing' | 'paused' | 'success' | 'crashed';
  elapsedTime: number;
  score: number;
  vehicle: VehicleState;
  inputs: VehicleInputs;

  // Sensors & Telemetry
  sensors: SensorData;

  // Perceptron Mathematical Model
  perceptron: PerceptronState;

  // Audio & Settings
  sound: SoundConfig;

  // Analytics & Metrics
  metrics: GameMetrics;

  // Actions
  setInputs: (inputs: Partial<VehicleInputs>) => void;
  setLevel: (level: number) => void;
  resetVehicle: () => void;
  togglePause: () => void;
  setPerceptronParams: (w1: number, w2: number, bias: number) => void;
  setManualOverride: (enabled: boolean, x1?: number, x2?: number) => void;
  setSensorThresholds: (th1: number, th2: number) => void;
  setSoundConfig: (config: Partial<SoundConfig>) => void;
  stepSimulation: (dt: number) => void;
  resetMetrics: () => void;
}

const initialVehicle = (levelId = 1): VehicleState => {
  const lvl = LEVELS[levelId - 1] || LEVELS[0];
  return {
    x: lvl.startPosition.x,
    z: lvl.startPosition.z,
    heading: lvl.startPosition.heading,
    steeringAngle: 0,
    speed: 0,
    gear: 'P',
    isReversing: false,
    isBraking: false,
    collided: false,
    parked: false,
    parkingProgress: 0,
  };
};

const initialSensors: SensorData = {
  distance1: 250,
  distance2: 250,
  threshold1: 100, // cm
  threshold2: 30,  // cm
  x1: 0,
  x2: 0,
  nearestDistance: 250,
  rawDistanceLeft: 2.5,
  rawDistanceRight: 2.5,
  rayIntersectLeft: false,
  rayIntersectRight: false,
  rayHitPointLeft: null,
  rayHitPointRight: null,
};

const initialPerceptron: PerceptronState = {
  w1: 1.0,
  w2: 1.0,
  bias: -0.5,
  z: -0.5,
  y: 0,
  activeRowIndex: 0,
  manualOverride: false,
  manualX1: 0,
  manualX2: 0,
};

export const useStore = create<SimulationStore>((set, get) => ({
  theme: 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
    set({ theme: next });
  },

  cameraMode: 'tppBack',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  activePage: 'simulator', // Centerpiece: start directly in the parking simulator!
  setActivePage: (page) => set({ activePage: page }),

  currentLevelIndex: 1,
  gameStatus: 'playing',
  elapsedTime: 0,
  score: 1000,
  vehicle: initialVehicle(1),
  inputs: {
    forward: false,
    reverse: false,
    left: false,
    right: false,
    brake: false,
  },

  sensors: initialSensors,
  perceptron: initialPerceptron,

  sound: {
    muted: false,
    masterVolume: 0.6,
    engineSound: true,
    beepsEnabled: true,
    sfxEnabled: true,
  },

  metrics: {
    totalAttempts: 1,
    successfulAttempts: 0,
    collisions: 0,
    totalTimeSeconds: 0,
    warningActivations: 0,
    averageParkingTime: 0,
    highScore: 0,
  },

  setInputs: (newInputs) => {
    set((state) => ({
      inputs: { ...state.inputs, ...newInputs },
    }));
  },

  setLevel: (level) => {
    const clampedLevel = Math.max(1, Math.min(3, level));
    set((state) => ({
      currentLevelIndex: clampedLevel,
      vehicle: initialVehicle(clampedLevel),
      gameStatus: 'playing',
      elapsedTime: 0,
      score: 1000,
      metrics: {
        ...state.metrics,
        totalAttempts: state.metrics.totalAttempts + 1,
      },
    }));
  },

  resetVehicle: () => {
    const lvlIndex = get().currentLevelIndex;
    set((state) => ({
      vehicle: initialVehicle(lvlIndex),
      gameStatus: 'playing',
      elapsedTime: 0,
      score: 1000,
      metrics: {
        ...state.metrics,
        totalAttempts: state.metrics.totalAttempts + 1,
      },
    }));
  },

  togglePause: () => {
    set((state) => ({
      gameStatus: state.gameStatus === 'playing' ? 'paused' : 'playing',
    }));
  },

  setPerceptronParams: (w1, w2, bias) => {
    set((state) => {
      const x1 = state.perceptron.manualOverride ? state.perceptron.manualX1 : state.sensors.x1;
      const x2 = state.perceptron.manualOverride ? state.perceptron.manualX2 : state.sensors.x2;
      const calc = computePerceptron(x1, x2, w1, w2, bias);

      // Update active truth table row index
      let rowIndex = 0;
      if (x1 === 0 && x2 === 1) rowIndex = 1;
      else if (x1 === 1 && x2 === 0) rowIndex = 2;
      else if (x1 === 1 && x2 === 1) rowIndex = 3;

      return {
        perceptron: {
          ...state.perceptron,
          w1,
          w2,
          bias,
          z: calc.z,
          y: calc.y,
          activeRowIndex: rowIndex,
        },
      };
    });
  },

  setManualOverride: (enabled, x1, x2) => {
    set((state) => {
      const nextX1 = x1 !== undefined ? x1 : state.perceptron.manualX1;
      const nextX2 = x2 !== undefined ? x2 : state.perceptron.manualX2;
      const activeX1 = enabled ? nextX1 : state.sensors.x1;
      const activeX2 = enabled ? nextX2 : state.sensors.x2;
      const calc = computePerceptron(
        activeX1,
        activeX2,
        state.perceptron.w1,
        state.perceptron.w2,
        state.perceptron.bias
      );

      let rowIndex = 0;
      if (activeX1 === 0 && activeX2 === 1) rowIndex = 1;
      else if (activeX1 === 1 && activeX2 === 0) rowIndex = 2;
      else if (activeX1 === 1 && activeX2 === 1) rowIndex = 3;

      return {
        perceptron: {
          ...state.perceptron,
          manualOverride: enabled,
          manualX1: nextX1,
          manualX2: nextX2,
          z: calc.z,
          y: calc.y,
          activeRowIndex: rowIndex,
        },
      };
    });
  },

  setSensorThresholds: (th1, th2) => {
    set((state) => ({
      sensors: {
        ...state.sensors,
        threshold1: th1,
        threshold2: th2,
      },
    }));
  },

  setSoundConfig: (config) => {
    set((state) => {
      const nextSound = { ...state.sound, ...config };
      if (config.muted !== undefined) {
        soundManager.setMuted(config.muted);
      }
      if (config.masterVolume !== undefined) {
        soundManager.setVolume(config.masterVolume);
      }
      return { sound: nextSound };
    });
  },

  stepSimulation: (dt) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;

    const currentLevel = LEVELS[state.currentLevelIndex - 1] || LEVELS[0];

    // Update moving obstacles (for Level 3)
    currentLevel.obstacles.forEach((obs) => {
      if (obs.moving) {
        const m = obs.moving;
        obs.x += m.speed * m.currentDirection * dt;
        if (obs.x >= m.max) {
          obs.x = m.max;
          m.currentDirection = -1;
        } else if (obs.x <= m.min) {
          obs.x = m.min;
          m.currentDirection = 1;
        }
      }
    });

    // 1. Update vehicle physics
    const nextVehicle = updateVehiclePhysics(state.vehicle, state.inputs, dt);

    // 2. Check collisions
    const colResult = testVehicleCollision(nextVehicle, currentLevel.obstacles);
    let nextGameStatus: 'playing' | 'paused' | 'success' | 'crashed' = state.gameStatus;
    let nextCollisions = state.metrics.collisions;

    if (colResult.collided && !state.vehicle.collided) {
      soundManager.playCollision();
      nextVehicle.collided = true;
      nextVehicle.speed = -state.vehicle.speed * 0.3; // bounce back
      nextCollisions += 1;
    } else if (!colResult.collided) {
      nextVehicle.collided = false;
    }

    // 3. Ultrasonic Sensor Calculations (Mounted at rear bumper)
    // Rear center bumper location:
    const rearDist = CAR_CONFIG.carLength / 2;
    const rearAngle = nextVehicle.heading + Math.PI; // pointing backward
    const cosH = Math.cos(nextVehicle.heading);
    const sinH = Math.sin(nextVehicle.heading);

    // Rear bumper center:
    const rearCenterX = nextVehicle.x - rearDist * sinH;
    const rearCenterZ = nextVehicle.z - rearDist * cosH;

    // Sensor 1 (Rear Left, offset by -0.6m laterally)
    const s1Origin = {
      x: rearCenterX - 0.6 * cosH,
      z: rearCenterZ + 0.6 * sinH,
    };
    // Sensor 2 (Rear Right, offset by +0.6m laterally)
    const s2Origin = {
      x: rearCenterX + 0.6 * cosH,
      z: rearCenterZ - 0.6 * sinH,
    };

    // Cast rays slightly angled outward for realistic radar coverage
    const s1Ray = castSensorRay(s1Origin, rearAngle - 0.12, currentLevel.obstacles, 3.0);
    const s2Ray = castSensorRay(s2Origin, rearAngle + 0.12, currentLevel.obstacles, 3.0);

    const dist1Cm = Math.round(s1Ray.distance * 100);
    const dist2Cm = Math.round(s2Ray.distance * 100);
    const nearestDistCm = Math.min(dist1Cm, dist2Cm);

    // Binary inputs conversion based on thresholds
    // Sensor 1: General obstacle detection (Threshold: 100 cm)
    // Sensor 2: Critical proximity detection (Threshold: 30 cm)
    const x1 = dist1Cm <= state.sensors.threshold1 || dist2Cm <= state.sensors.threshold1 ? 1 : 0;
    const x2 = dist1Cm <= state.sensors.threshold2 || dist2Cm <= state.sensors.threshold2 ? 1 : 0;

    const activeX1 = state.perceptron.manualOverride ? state.perceptron.manualX1 : x1;
    const activeX2 = state.perceptron.manualOverride ? state.perceptron.manualX2 : x2;

    // 4. Perceptron Calculation
    const calc = computePerceptron(
      activeX1,
      activeX2,
      state.perceptron.w1,
      state.perceptron.w2,
      state.perceptron.bias
    );

    let rowIndex = 0;
    if (activeX1 === 0 && activeX2 === 1) rowIndex = 1;
    else if (activeX1 === 1 && activeX2 === 0) rowIndex = 2;
    else if (activeX1 === 1 && activeX2 === 1) rowIndex = 3;

    // Warning audio update
    if (state.sound.beepsEnabled) {
      soundManager.updateWarningBeeps(calc.active, nearestDistCm);
    }
    if (state.sound.engineSound) {
      soundManager.updateEngineSpeed(nextVehicle.speed);
    }

    // 5. Evaluate parking progress & success
    const parkingEval = evaluateParking(nextVehicle, currentLevel.targetBay);
    nextVehicle.parkingProgress = parkingEval.accuracy;

    let successfulAttempts = state.metrics.successfulAttempts;
    let warningCount = state.metrics.warningActivations;
    if (calc.active && state.perceptron.y === 0) {
      warningCount += 1;
    }

    if (parkingEval.isParked && !state.vehicle.parked) {
      nextVehicle.parked = true;
      nextGameStatus = 'success';
      successfulAttempts += 1;
      soundManager.playSuccess();
    }

    // 6. Update Elapsed Time & Score
    const nextTime = state.elapsedTime + dt;
    const timePenalty = Math.floor(nextTime * 2);
    const collisionPenalty = nextCollisions * 150;
    const nextScore = Math.max(0, 1000 - timePenalty - collisionPenalty);

    set({
      elapsedTime: nextTime,
      score: nextScore,
      gameStatus: nextGameStatus,
      vehicle: nextVehicle,
      sensors: {
        ...state.sensors,
        distance1: dist1Cm,
        distance2: dist2Cm,
        nearestDistance: nearestDistCm,
        x1,
        x2,
        rawDistanceLeft: s1Ray.distance,
        rawDistanceRight: s2Ray.distance,
        rayIntersectLeft: s1Ray.hit,
        rayIntersectRight: s2Ray.hit,
        rayHitPointLeft: s1Ray.hitPoint,
        rayHitPointRight: s2Ray.hitPoint,
      },
      perceptron: {
        ...state.perceptron,
        z: calc.z,
        y: calc.y,
        activeRowIndex: rowIndex,
      },
      metrics: {
        ...state.metrics,
        collisions: nextCollisions,
        successfulAttempts,
        warningActivations: warningCount,
        totalTimeSeconds: state.metrics.totalTimeSeconds + dt,
        averageParkingTime: Math.round(
          (state.metrics.totalTimeSeconds + dt) / Math.max(1, state.metrics.totalAttempts)
        ),
      },
    });
  },

  resetMetrics: () => {
    set((state) => ({
      metrics: {
        totalAttempts: 1,
        successfulAttempts: 0,
        collisions: 0,
        totalTimeSeconds: 0,
        warningActivations: 0,
        averageParkingTime: 0,
        highScore: 0,
      },
    }));
  },
}));
