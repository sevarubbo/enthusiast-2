import { createDefenderA } from "./defender-a";
import { createEnemyC } from "./enemyC";
import { createPlantA } from "./plant-a";
import { createPlantEaterA } from "./plant-eater-a";
import { createShieldItem } from "./shield-item";
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
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
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

      // After death
      if (this.health.current <= 0) {
        // Drop shield item
        if (Math.random() < 0.3) {
          getState().gameObjectsManager.spawnObject(
            createEnemyC({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.1) {
          getState().gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
          // eslint-disable-next-line no-dupe-else-if
        } else if (Math.random() < 0.1) {
          getState().gameObjectsManager.spawnObject(
            createPlantEaterA({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.05) {
          getState().gameObjectsManager.spawnObject(
            createDefenderA({ x: this.x, y: this.y }),
          );
          // eslint-disable-next-line no-dupe-else-if
        } else if (Math.random() < 0.3) {
          getState().gameObjectsManager.spawnObject(
            createPlantA({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
