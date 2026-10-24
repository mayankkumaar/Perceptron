import { VehicleState, ParkingBay } from '../types';

export interface VehicleInputs {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export const CAR_CONFIG = {
  wheelbase: 2.6, // meters
  carWidth: 1.9,
  carLength: 4.2,
  maxForwardSpeed: 6.5, // m/s (~23 km/h parking lot limit)
  maxReverseSpeed: -3.5, // m/s (~12 km/h reverse limit)
  acceleration: 4.5, // m/s^2
  reverseAcceleration: 3.2,
  friction: 3.0, // rolling resistance
  brakingDeceleration: 9.0, // strong brakes
  maxSteerAngle: 0.58, // ~33 degrees
  steerSpeed: 2.6, // radians/sec
  steerReturnSpeed: 3.5,
};

/**
 * Updates vehicle position, velocity, and orientation based on user inputs
 * using a kinematic bicycle model.
 */
export function updateVehiclePhysics(
  currentState: VehicleState,
  inputs: VehicleInputs,
  dt: number
): VehicleState {
  const next = { ...currentState };

  // 1. Steering dynamics
  if (inputs.left) {
    next.steeringAngle = Math.min(
      CAR_CONFIG.maxSteerAngle,
      next.steeringAngle + CAR_CONFIG.steerSpeed * dt
    );
  } else if (inputs.right) {
    next.steeringAngle = Math.max(
      -CAR_CONFIG.maxSteerAngle,
      next.steeringAngle - CAR_CONFIG.steerSpeed * dt
    );
  } else {
    // Return steering wheel to center
    if (next.steeringAngle > 0.01) {
      next.steeringAngle = Math.max(0, next.steeringAngle - CAR_CONFIG.steerReturnSpeed * dt);
    } else if (next.steeringAngle < -0.01) {
      next.steeringAngle = Math.min(0, next.steeringAngle + CAR_CONFIG.steerReturnSpeed * dt);
    } else {
      next.steeringAngle = 0;
    }
  }

  // 2. Acceleration / Braking / Friction
  next.isBraking = inputs.brake;

  if (inputs.brake) {
    // Active braking
    if (next.speed > 0) {
      next.speed = Math.max(0, next.speed - CAR_CONFIG.brakingDeceleration * dt);
    } else if (next.speed < 0) {
      next.speed = Math.min(0, next.speed + CAR_CONFIG.brakingDeceleration * dt);
    }
  } else {
    // Forward drive
    if (inputs.forward) {
      next.speed = Math.min(
        CAR_CONFIG.maxForwardSpeed,
        next.speed + CAR_CONFIG.acceleration * dt
      );
    } else if (inputs.reverse) {
      // Reverse drive
      next.speed = Math.max(
        CAR_CONFIG.maxReverseSpeed,
        next.speed - CAR_CONFIG.reverseAcceleration * dt
      );
    } else {
      // Passive rolling friction
      if (next.speed > 0.05) {
        next.speed = Math.max(0, next.speed - CAR_CONFIG.friction * dt);
      } else if (next.speed < -0.05) {
        next.speed = Math.min(0, next.speed + CAR_CONFIG.friction * dt);
      } else {
        next.speed = 0;
      }
    }
  }

  // 3. Gear calculation
  if (next.speed > 0.1) {
    next.gear = 'D';
    next.isReversing = false;
  } else if (next.speed < -0.1 || inputs.reverse) {
    next.gear = 'R';
    next.isReversing = true;
  } else {
    next.gear = 'P';
    next.isReversing = false;
  }

  // 4. Kinematic Bicycle Motion equations
  if (Math.abs(next.speed) > 0.001) {
    // Angular velocity: dTheta = (speed / L) * tan(delta)
    const angularVelocity = (next.speed / CAR_CONFIG.wheelbase) * Math.tan(next.steeringAngle);
    next.heading += angularVelocity * dt;

    // Displacement along heading
    next.x += next.speed * Math.sin(next.heading) * dt;
    next.z += next.speed * Math.cos(next.heading) * dt;
  }

  return next;
}

/**
 * Calculates parking accuracy percentage (0 - 100%) and determines if parked successfully
 */
export function evaluateParking(
  vehicle: VehicleState,
  targetBay: ParkingBay
): { accuracy: number; isParked: boolean } {
  // Distance from vehicle center to target bay center
  const dx = vehicle.x - targetBay.x;
  const dz = vehicle.z - targetBay.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  // Normalize heading difference (-PI to PI)
  let headingDiff = Math.abs(vehicle.heading - targetBay.targetHeading) % (2 * Math.PI);
  if (headingDiff > Math.PI) headingDiff = 2 * Math.PI - headingDiff;

  // Max tolerances
  const maxAllowableDist = 2.4;
  const maxAllowableAngle = Math.PI / 4; // 45 deg

  const posScore = Math.max(0, 1 - dist / maxAllowableDist);
  const angleScore = Math.max(0, 1 - headingDiff / maxAllowableAngle);

  const accuracy = Math.round((posScore * 0.65 + angleScore * 0.35) * 100);

  // Parked condition: inside bay with low speed
  const isParked =
    dist < 0.85 &&
    headingDiff < 0.28 && // ~16 degrees
    Math.abs(vehicle.speed) < 0.2;

  return { accuracy, isParked };
}
