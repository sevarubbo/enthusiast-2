import { vector } from "./vector";
import type { Vector } from "./vector";

export type Matrix = [Vector, Vector];

export const matrix = {
  create(a: number, b: number, c: number, d: number): Matrix {
    return [vector.create(a, b), vector.create(c, d)];
  },

  fitPoint(point: Vector, mtrx: Matrix): Vector {
    let x = Math.max(point.x, mtrx[0].x);
    let y = Math.max(point.y, mtrx[0].y);

    x = Math.min(x, mtrx[0].x + mtrx[1].x);
    y = Math.min(y, mtrx[0].y + mtrx[1].y);

    return vector.create(x, y);
  },

  withinBox(point: Vector, mtrx: Matrix): boolean {
    if (point.x < mtrx[0].x) {
      return false;
    }

    if (point.y < mtrx[0].y) {
      return false;
    }

    if (point.x > mtrx[0].x + mtrx[1].x) {
      return false;
    }

    if (point.y > mtrx[0].y + mtrx[1].y) {
      return false;
    }

    return true;
  },
};
