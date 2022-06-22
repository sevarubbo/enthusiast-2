import { vector } from "./vector";
import type { Matrix } from "./matrix";
import type { Vector } from "./vector";

export interface Circle extends Vector {
  radius: number;
}

export const circle = {
  circlesCollide(c1: Circle, c2: Circle) {
    return vector.distance(c1, c2) < c1.radius + c2.radius;
  },
  collidesWithLine(c: Circle, line: Matrix) {
    const bd: Matrix = [line[1], c];
    const angle = vector.getAngleBetweenTwoLines(line, bd);
    const cdLength = Math.sin(angle) * vector.distance(...bd);

    return cdLength <= c.radius;
  },
};
