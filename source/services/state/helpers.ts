import { circle } from "services/circle";
import type { Matrix } from "services/matrix";
import type { State } from "services/state";
import type { StateObject } from "types";

export function getFirstObjectLineCollision(
  state: State,
  line: Matrix,
  condition: (object: StateObject) => boolean,
): StateObject | null {
  // create rectangle from line
  const rectangle = {
    x: line[0].x,
    y: line[0].y,
    width: line[1].x - line[0].x,
    height: line[1].y - line[0].y,
  };

  const nearbyObjects = state.quadtree.query(rectangle);

  for (const otherObject of nearbyObjects) {
    if (!condition(otherObject)) {
      continue;
    }

    if ("collisionCircle" in otherObject) {
      const collisionCircle = {
        x: otherObject.x,
        y: otherObject.y,
        radius: otherObject.collisionCircle.radius,
      };

      if (circle.collidesWithLine(collisionCircle, line)) {
        return otherObject;
      }
    }

    if (!("collision" in otherObject)) {
      continue;
    }

    if ("boxSize" in otherObject.collision) {
      if (
        doesRectangleCollideWithLine(
          otherObject.x,
          otherObject.y,
          otherObject.collision.boxSize.x,
          otherObject.collision.boxSize.y,
          line,
        )
      ) {
        return otherObject;
      }
    }
  }

  return null;
}

const doesRectangleCollideWithLine = (
  x: number,
  y: number,
  width: number,
  height: number,
  line: Matrix,
): boolean => {
  const [a, b] = line;

  if (lineRectangleIntersect(a.x, a.y, b.x, b.y, x, y, width, height)) {
    return true;
  }

  return false;
};

const lineRectangleIntersect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean => {
  return (
    lineLineIntersect(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
    lineLineIntersect(x1, y1, x2, y2, rx, ry, rx, ry + rh) ||
    lineLineIntersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
    lineLineIntersect(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh)
  );
};

const lineLineIntersect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
) => {
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  if (denominator === 0) {
    return false;
  }

  let a = y1 - y3;
  let b = x1 - x3;
  const numerator1 = (x4 - x3) * a - (y4 - y3) * b;
  const numerator2 = (x2 - x1) * a - (y2 - y1) * b;

  a = numerator1 / denominator;
  b = numerator2 / denominator;

  return a > 0 && a < 1 && b > 0 && b < 1;
};
