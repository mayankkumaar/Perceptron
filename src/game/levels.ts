import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Level 1: Basic Parking',
    subtitle: 'Wide Bay & Static Obstacle',
    difficulty: 'Beginner',
    description: 'Learn ultrasonic sensor detection. Reverse into the wide marked parking bay without bumping the rear concrete curb wall.',
    startPosition: {
      x: 0,
      z: 14,
      heading: 0, // facing forward (+Z or towards bay)
    },
    targetBay: {
      x: 0,
      z: -4,
      width: 3.6,
      length: 5.6,
      rotation: 0,
      targetHeading: Math.PI, // reverse parking requested
    },
    obstacles: [
      // Rear wall behind bay
      {
        id: 'wall-back-1',
        x: 0,
        z: -7.5,
        width: 12,
        depth: 0.8,
        height: 1.2,
        color: '#475569',
        type: 'wall',
      },
      // Left guide barrier
      {
        id: 'wall-left-1',
        x: -4.5,
        z: -4,
        width: 0.6,
        depth: 7,
        height: 0.9,
        color: '#334155',
        type: 'wall',
      },
      // Right guide barrier
      {
        id: 'wall-right-1',
        x: 4.5,
        z: -4,
        width: 0.6,
        depth: 7,
        height: 0.9,
        color: '#334155',
        type: 'wall',
      },
      // Single static cone / post in rear-center to demonstrate zone detection
      {
        id: 'post-1',
        x: 0,
        z: -6.6,
        width: 0.6,
        depth: 0.6,
        height: 1.0,
        color: '#F59E0B',
        type: 'pillar',
      },
    ],
  },
  {
    id: 2,
    title: 'Level 2: Narrow Parking Bay',
    subtitle: 'Between Parked Sedans & Pillars',
    difficulty: 'Intermediate',
    description: 'Narrow parking space between two parked vehicles. Sensor 1 will alert you of proximity to the adjacent cars, while Sensor 2 prevents hitting the rear pillar.',
    startPosition: {
      x: 6,
      z: 12,
      heading: -Math.PI / 4,
    },
    targetBay: {
      x: 0,
      z: -3.5,
      width: 2.8,
      length: 5.2,
      rotation: 0,
      targetHeading: Math.PI,
    },
    obstacles: [
      // Parked car to the left (Blue SUV)
      {
        id: 'car-left-2',
        x: -2.6,
        z: -3.5,
        width: 2.0,
        depth: 4.4,
        height: 1.5,
        color: '#1E3A8A',
        type: 'parked-car',
      },
      // Parked car to the right (Silver Sedan)
      {
        id: 'car-right-2',
        x: 2.6,
        z: -3.5,
        width: 2.0,
        depth: 4.4,
        height: 1.4,
        color: '#64748B',
        type: 'parked-car',
      },
      // Rear concrete pillar behind target bay
      {
        id: 'pillar-rear-2',
        x: 0,
        z: -6.8,
        width: 1.2,
        depth: 1.2,
        height: 2.5,
        color: '#475569',
        type: 'pillar',
      },
      // Perimeter wall
      {
        id: 'wall-perimeter-back',
        x: 0,
        z: -8.5,
        width: 18,
        depth: 0.8,
        height: 1.5,
        color: '#1E293B',
        type: 'wall',
      },
    ],
  },
  {
    id: 3,
    title: 'Level 3: Challenge Mode',
    subtitle: 'Moving Obstacles & Tight Maneuvering',
    difficulty: 'Advanced',
    description: 'Dynamic environment with a moving pedestrian/cart patrol crossing behind the parking aisle. Watch the Perceptron OR logic activate instantly as the moving obstacle passes!',
    startPosition: {
      x: -7,
      z: 15,
      heading: Math.PI / 6,
    },
    targetBay: {
      x: 0,
      z: -3.2,
      width: 2.7,
      length: 5.0,
      rotation: 0,
      targetHeading: Math.PI,
    },
    obstacles: [
      // Left parked car (Red Hatchback)
      {
        id: 'car-left-3',
        x: -2.5,
        z: -3.2,
        width: 1.9,
        depth: 4.3,
        height: 1.4,
        color: '#B91C1C',
        type: 'parked-car',
      },
      // Right parked car (Dark Grey Van)
      {
        id: 'car-right-3',
        x: 2.5,
        z: -3.2,
        width: 2.0,
        depth: 4.5,
        height: 1.7,
        color: '#334155',
        type: 'parked-car',
      },
      // Moving pedestrian / service cart obstacle traversing behind aisle
      {
        id: 'moving-cart-3',
        x: -4.5,
        z: 4.5,
        width: 1.0,
        depth: 1.0,
        height: 1.3,
        color: '#00F0FF',
        type: 'moving',
        moving: {
          axis: 'x',
          min: -5.5,
          max: 5.5,
          speed: 1.8,
          currentDirection: 1,
        },
      },
      // Rear wall with hazard stripes
      {
        id: 'wall-back-3',
        x: 0,
        z: -7.0,
        width: 18,
        depth: 0.8,
        height: 1.6,
        color: '#0F172A',
        type: 'wall',
      },
      // Structural column
      {
        id: 'column-3',
        x: 5.0,
        z: 4.0,
        width: 1.2,
        depth: 1.2,
        height: 3.0,
        color: '#64748B',
        type: 'pillar',
      },
    ],
  },
];
