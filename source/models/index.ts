import { createId } from "../helpers";
import { getPointerPosition } from "../services/io";
import { vector } from "../services/vector";
import type { Drawable, Identifiable, Updatable } from "../services/state";
import type { Vector } from "../services/vector";

interface Circle extends Identifiable, Drawable, Updatable {
  type: "circle";
}

export function createCircle(): Circle {
  return {
    id: createId(),
    type: "circle",
    x: 300,
    y: 200,
    color: "green",
    radius: 20,
    drawable: true,

    update() {
      const pointerPosition = getPointerPosition();

      this.x = pointerPosition.x;
      this.y = pointerPosition.y;
    },
  };
}

// Triangle
interface Triangle extends Identifiable, Drawable, Updatable {
  type: "triangle";
  color: "yellow";
  targetPoint?: Vector;
}

export function createTriangle(): Triangle {
  return {
    id: createId(),
    type: "triangle",
    x: 500,
    y: 400,
    color: "yellow",
    radius: 10,
    drawable: true,

    update() {
      if (!this.targetPoint) {
        this.targetPoint = { x: Math.random() * 500, y: Math.random() * 500 };
      }

      // Walk to random points
      const d = vector.distance(this, this.targetPoint);

      if (d < 100) {
        this.targetPoint = undefined;

        return;
      }

      const direction = vector.direction(this, this.targetPoint);

      this.x += direction.x;
      this.y += direction.y;
    },
  };
}
