import type { Matrix } from "./matrix";

export interface Vector {
  x: number;
  y: number;
}

export const vector = {
  create(x: number, y: number): Vector {
    return { x, y };
  },
  distance(vector1: Vector, vector2: Vector) {
    return Math.sqrt((vector2.x - vector1.x) ** 2 + (vector2.y - vector1.y) ** 2);
  },
  scale(v: Vector, value: number): Vector {
    return {
      x: v.x * value,
      y: v.y * value,
    };
  },
  add(...vectors: Vector[]): Vector {
    return {
      x: vectors.reduce((s, c) => s + c.x, 0),
      y: vectors.reduce((s, c) => s + c.y, 0),
    };
  },
  subtract(vector1: Vector, vector2: Vector): Vector {
    return {
      x: vector1.x - vector2.x,
      y: vector1.y - vector2.y,
    };
  },
  normalize(v: Vector): Vector {
    const length = vector.distance({ x: 0, y: 0 }, v);

    return vector.scale(v, 1 / length);
  },
  direction(vector1: Vector, vector2: Vector): Vector {
    return vector.normalize(vector.subtract(vector2, vector1));
  },
  fromAngle(angle: number) {
    return vector.create(Math.cos(angle), Math.sin(angle));
  },
  getAngleBetweenTwoPoints(p1: Vector, p2: Vector): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  },
  getAngleBetweenTwoLines(line1: Matrix, line2: Matrix) {
    const dAx = line1[1].x - line1[0].x;
    const dAy = line1[1].y - line1[0].y;
    const dBx = line2[1].x - line2[0].x;
    const dBy = line2[1].y - line2[0].y;

    let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);

    if (angle < 0) {
      angle = angle * -1;
    }

    return angle;
  },
};
