import { ObstacleBox, VehicleState } from '../types';

export interface Point2D {
  x: number;
  z: number;
}

export interface RayIntersection {
  hit: boolean;
  distance: number; // in meters
  hitPoint: [number, number, number] | null;
}

/**
 * Returns the 4 corner points of an oriented bounding box centered at (x, z)
 * with given width, depth and rotation (yaw in radians).
 */
export function getOBBCorners(
  cx: number,
  cz: number,
  width: number,
  depth: number,
  angle: number
): Point2D[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = width / 2;
  const hd = depth / 2;

  // Local corners relative to center
  const localCorners = [
    { x: -hw, z: -hd },
    { x: hw, z: -hd },
    { x: hw, z: hd },
    { x: -hw, z: hd },
  ];

  return localCorners.map((p) => ({
    x: cx + (p.x * cos - p.z * sin),
    z: cz + (p.x * sin + p.z * cos),
  }));
}

/**
 * Separating Axis Theorem (SAT) for 2D Oriented Bounding Box collision check
 */
export function checkOBBCollision(
  boxA: Point2D[],
  boxB: Point2D[]
): boolean {
  const polygons = [boxA, boxB];

  for (let p = 0; p < polygons.length; p++) {
    const polygon = polygons[p];
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];

      // Normal to edge (p2 - p1)
      const edgeX = p2.x - p1.x;
      const edgeZ = p2.z - p1.z;
      const axisX = -edgeZ;
      const axisZ = edgeX;

      // Project boxA
      let minA = Infinity;
      let maxA = -Infinity;
      for (const pt of boxA) {
        const proj = pt.x * axisX + pt.z * axisZ;
        if (proj < minA) minA = proj;
        if (proj > maxA) maxA = proj;
      }

      // Project boxB
      let minB = Infinity;
      let maxB = -Infinity;
      for (const pt of boxB) {
        const proj = pt.x * axisX + pt.z * axisZ;
        if (proj < minB) minB = proj;
        if (proj > maxB) maxB = proj;
      }

      // If separated on this axis, no collision
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks vehicle collision against all obstacles in current level
 */
export function testVehicleCollision(
  vehicle: VehicleState,
  obstacles: ObstacleBox[],
  carWidth = 1.9,
  carLength = 4.2
): { collided: boolean; collidedWith?: string } {
  const carCorners = getOBBCorners(
    vehicle.x,
    vehicle.z,
    carWidth,
    carLength,
    vehicle.heading
  );

  for (const obs of obstacles) {
    const obsCorners = getOBBCorners(
      obs.x,
      obs.z,
      obs.width,
      obs.depth,
      obs.rotation || 0
    );

    if (checkOBBCollision(carCorners, obsCorners)) {
      return { collided: true, collidedWith: obs.id };
    }
  }

  return { collided: false };
}

/**
 * Ray vs 2D Line Segment intersection
 */
function raySegmentIntersect(
  rayOrigin: Point2D,
  rayDir: Point2D,
  p1: Point2D,
  p2: Point2D,
  maxDist: number
): { hit: boolean; distance: number; hitPoint?: Point2D } {
  const v1 = { x: rayOrigin.x - p1.x, z: rayOrigin.z - p1.z };
  const v2 = { x: p2.x - p1.x, z: p2.z - p1.z };
  const v3 = { x: -rayDir.z, z: rayDir.x };

  const dot = v2.x * v3.x + v2.z * v3.z;
  if (Math.abs(dot) < 0.000001) return { hit: false, distance: maxDist };

  const t1 = (v2.x * v1.z - v2.z * v1.x) / dot;
  const t2 = (v1.x * v3.x + v1.z * v3.z) / dot;

  if (t1 >= 0 && t1 <= maxDist && t2 >= 0 && t2 <= 1) {
    return {
      hit: true,
      distance: t1,
      hitPoint: {
        x: rayOrigin.x + rayDir.x * t1,
        z: rayOrigin.z + rayDir.z * t1,
      },
    };
  }

  return { hit: false, distance: maxDist };
}

/**
 * Casts a single ultrasonic sensor ray against all obstacles
 */
export function castSensorRay(
  origin: Point2D,
  directionAngle: number,
  obstacles: ObstacleBox[],
  maxRangeMeters = 3.0
): RayIntersection {
  const dirX = Math.sin(directionAngle);
  const dirZ = Math.cos(directionAngle);
  const rayDir = { x: dirX, z: dirZ };

  let closestDist = maxRangeMeters;
  let closestHit: Point2D | null = null;
  let didHit = false;

  for (const obs of obstacles) {
    const corners = getOBBCorners(
      obs.x,
      obs.z,
      obs.width,
      obs.depth,
      obs.rotation || 0
    );

    // Test against the 4 edges of the obstacle
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const res = raySegmentIntersect(origin, rayDir, p1, p2, maxRangeMeters);

      if (res.hit && res.distance < closestDist) {
        closestDist = res.distance;
        closestHit = res.hitPoint || null;
        didHit = true;
      }
    }
  }

  return {
    hit: didHit,
    distance: closestDist,
    hitPoint: closestHit ? [closestHit.x, 0.4, closestHit.z] : null,
  };
}
