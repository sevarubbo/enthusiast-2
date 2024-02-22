import type { Matrix } from "./matrix";
import type { Vector } from "./vector";

export interface Circle extends Vector {
  radius: number;
}

export const circle = {
  collidesWithLine(c: Circle, line: Matrix) {
    return lineCircleIntersect(
      line[0].x,
      line[0].y,
      line[1].x,
      line[1].y,
      c.x,
      c.y,
      c.radius,
    );
  },
};

function lineCircleIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  // Calculate the distance between the circle center and the line segment
  const dx: number = x2 - x1;
  const dy: number = y2 - y1;
  const len: number = Math.sqrt(dx * dx + dy * dy);
  const dot: number =
    ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(len, 2);
  const closestX: number = x1 + dot * (x2 - x1);
  const closestY: number = y1 + dot * (y2 - y1);

  // Check if the closest point is within the line segment
  if (dot < 0 || dot > 1) {
    return false;
  }

  // Check if the closest point is within the circle
  const distX: number = closestX - cx;
  const distY: number = closestY - cy;
  const distance: number = Math.sqrt(distX * distX + distY * distY);

  return distance <= r;
}
