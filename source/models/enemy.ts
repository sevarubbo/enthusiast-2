import { createId } from "../helpers";
import { matrix } from "../services/matrix";
import { vector } from "services/vector";
import type { Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

export interface Enemy extends Identifiable, Updatable, Vector {
  type: "enemy";
  color: "red";
  radius: 7;
  targetPoint?: Vector;
  speed: number;
}

export function createEnemy(): Enemy {
  const RANDOM_POINT_OFFSET = 40;

  return {
    id: createId(),
    type: "enemy",
    x: 0,
    y: 0,
    color: "red",
    radius: 7,
    speed: 0.01,

    update(delta, getState) {
      const state = getState();
      const speed = this.speed * delta;

      if (!this.targetPoint) {
        const worldBox = matrix.create(0, 0, state.world.size.x, state.world.size.y);

        this.targetPoint = matrix.fitPoint(
          {
            x: this.x - RANDOM_POINT_OFFSET + 2 * RANDOM_POINT_OFFSET * Math.random(),
            y: this.y - RANDOM_POINT_OFFSET + 2 * RANDOM_POINT_OFFSET * Math.random(),
          },
          worldBox,
        );
      }

      // Walk to random points
      const d = vector.distance(this, this.targetPoint);

      if (d < speed) {
        this.targetPoint = undefined;

        return;
      }

      const direction = vector.direction(this, this.targetPoint);

      this.x += direction.x * speed;
      this.y += direction.y * speed;
    },
  };
}
