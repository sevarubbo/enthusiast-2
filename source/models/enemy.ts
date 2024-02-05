import { createId } from "../helpers";
import { matrix } from "../services/matrix";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import type {
  ObjectHealthManager,
  Collidable,
  Identifiable,
  Updatable,
  Movable,
} from "services/state";

export interface Enemy extends Identifiable, Updatable, Collidable, Movable {
  type: "enemy";
  color: "red";
  radius: 7;
  health: ObjectHealthManager;
}

export function createEnemy(o: Partial<Pick<Enemy, "x" | "y">> = {}): Enemy {
  const RANDOM_POINT_OFFSET = 50;

  return {
    id: createId(),
    type: "enemy",
    x: o.x || 0,
    y: o.y || 0,
    color: "red",
    radius: 7,
    collisionCircle: { radius: 7 },
    health: createObjectHealthManager(10),
    movement: createObjectMovementManager({ maxSpeed: 0.01 }),
    collision: createObjectCollisionManager(),
    targetPoint: null,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);

      const { world } = getState();

      // Find target point
      if (!this.targetPoint) {
        const worldBox = matrix.create(0, 0, world.size.x, world.size.y);

        this.targetPoint = matrix.fitPoint(
          {
            x:
              this.x -
              RANDOM_POINT_OFFSET +
              2 * RANDOM_POINT_OFFSET * Math.random(),
            y:
              this.y -
              RANDOM_POINT_OFFSET +
              2 * RANDOM_POINT_OFFSET * Math.random(),
          },
          worldBox,
        );
      }

      if (this.collision.collidesWithObjects.length) {
        this.targetPoint = null;
        this.movement.stop();
      }
    },
  };
}
