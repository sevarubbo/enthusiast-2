import { createId } from "../helpers";
import { getPointerPosition } from "../services/io";
import { vector } from "../services/vector";
import type { Identifiable, Updatable } from "../services/state";
import type { Vector } from "../services/vector";

export interface Circle extends Identifiable, Updatable, Vector {
  type: "circle";
  color: "green";
  radius: 20;
}

export function createCircle(): Circle {
  return {
    id: createId(),
    type: "circle",
    x: 300,
    y: 200,
    color: "green",
    radius: 20,

    update() {
      const pointerPosition = getPointerPosition();

      this.x = pointerPosition.x;
      this.y = pointerPosition.y;
    },
  };
}

// Triangle
export interface Triangle extends Identifiable, Updatable, Vector {
  type: "triangle";
  color: "yellow";
  radius: 10;
  targetPoint?: Vector;
  speed: number;
}

export function createTriangle(): Triangle {
  return {
    id: createId(),
    type: "triangle",
    x: 500,
    y: 400,
    color: "yellow",
    radius: 10,
    speed: 20,

    update() {
      this.speed = getPointerPosition().x / 10;

      if (!this.targetPoint) {
        this.targetPoint = { x: Math.random() * 1000, y: Math.random() * 600 };
      }

      // Walk to random points
      const d = vector.distance(this, this.targetPoint);

      if (d < this.speed) {
        this.targetPoint = undefined;

        return;
      }

      const direction = vector.direction(this, this.targetPoint);

      this.x += direction.x * this.speed;
      this.y += direction.y * this.speed;
    },
  };
}
