import { createId } from "../helpers";
import { circle } from "../services/circle";
import { matrix } from "../services/matrix";
import {
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import { vector } from "services/vector";
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
    targetPoint: null,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      const { world, gameObjectsManager } = getState();

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

      const newPosition = this.movement.nextPosition;

      // Find collisions
      for (const id in gameObjectsManager.objects) {
        const object = gameObjectsManager.objects[id];

        if (object === this) {
          continue;
        }

        if ("collisionCircle" in object) {
          if (
            circle.circlesCollide(
              {
                x: newPosition.x,
                y: newPosition.y,
                radius: this.collisionCircle.radius,
              },
              {
                x: object.x,
                y: object.y,
                radius: object.collisionCircle.radius,
              },
            )
          ) {
            const newDirection = vector.direction(object, this);

            this.x += newDirection.x * this.movement.realSpeed;
            this.y += newDirection.y * this.movement.realSpeed;

            // Move in opposite direction from collision object
            this.movement.start(newDirection);

            break;
          }
        }
      }
    },
  };
}
