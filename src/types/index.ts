export type PageId =
  | 'overview'
  | 'simulator'
  | 'perceptron-lab'
  | 'sensor-lab'
  | 'logic-explorer'
  | 'mathematics'
  | 'testing'
  | 'documentation';

export type CameraMode = 'tpp' | 'tppBack' | 'backup' | 'isometric' | 'topDown';
export type ThemeMode = 'light' | 'dark';

export interface VehicleState {
  x: number;
  z: number;
  heading: number; // in radians
  steeringAngle: number; // in radians
  speed: number; // m/s or game units
  gear: 'D' | 'R' | 'P';
  isReversing: boolean;
  isBraking: boolean;
  collided: boolean;
  parked: boolean;
  parkingProgress: number; // 0 to 100%
}

export interface SensorData {
  distance1: number; // in cm
  distance2: number; // in cm
  threshold1: number; // default 100 cm
  threshold2: number; // default 30 cm
  x1: number; // 0 or 1
  x2: number; // 0 or 1
  nearestDistance: number; // in cm
  rawDistanceLeft: number;
  rawDistanceRight: number;
  rayIntersectLeft: boolean;
  rayIntersectRight: boolean;
  rayHitPointLeft: [number, number, number] | null;
  rayHitPointRight: [number, number, number] | null;
}

export interface PerceptronParams {
  w1: number;
  w2: number;
  bias: number;
}

export interface PerceptronState extends PerceptronParams {
  z: number; // weighted sum: w1*x1 + w2*x2 + bias
  y: number; // step activation: z >= 0 ? 1 : 0
  activeRowIndex: number;
  manualOverride: boolean;
  manualX1: number;
  manualX2: number;
}

export interface ParkingBay {
  x: number;
  z: number;
  width: number;
  length: number;
  rotation: number;
  targetHeading: number;
}

export interface ObstacleBox {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation?: number;
  color?: string;
  type: 'wall' | 'pillar' | 'parked-car' | 'moving' | 'curb';
  moving?: {
    axis: 'x' | 'z';
    min: number;
    max: number;
    speed: number;
    currentDirection: 1 | -1;
  };
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  targetBay: ParkingBay;
  obstacles: ObstacleBox[];
  startPosition: { x: number; z: number; heading: number };
}

export interface GameMetrics {
  totalAttempts: number;
  successfulAttempts: number;
  collisions: number;
  totalTimeSeconds: number;
  warningActivations: number;
  averageParkingTime: number;
  highScore: number;
}

export interface SoundConfig {
  muted: boolean;
  masterVolume: number;
  engineSound: boolean;
  beepsEnabled: boolean;
  sfxEnabled: boolean;
}
