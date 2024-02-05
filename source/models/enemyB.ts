import { createId } from "helpers";
import {
  createObjectMovementManager,
  createObjectHealthManager,
  createObjectCollisionManager,
  type ObjectHealthManager,
  type Collidable,
  type Identifiable,
  type Updatable,
  type Movable,
} from "services/state";
import { vector } from "services/vector";
import type { Tower } from "./tower";
import type { Vector } from "services/vector";

export interface EnemyB
  extends Identifiable,
    Updatable,
    Vector,
    Collidable,
    Movable {
  type: "enemyB";
  color: "pink";
  radius: 10;
  health: ObjectHealthManager;
}

export function createEnemyB(o: Partial<Pick<EnemyB, "x" | "y">> = {}): EnemyB {
  return {
    id: createId(),
    type: "enemyB",
    x: o.x || 0,
    y: o.y || 0,
    color: "pink",
    radius: 10,
    collisionCircle: { radius: 7 },
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.1 }),
    collision: createObjectCollisionManager(),
    targetPoint: null,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);

      const { gameObjectsManager } = getState();

      // Find first tower
      const towers = gameObjectsManager.findObjectsByType<Tower>("tower");
      let closestTower = towers.length ? towers[0] : null;

      // Find closest tower
      for (const tower of towers) {
        if (
          vector.distance(this, tower) <
          vector.distance(this, closestTower as Tower)
        ) {
          closestTower = tower;
        }
      }

      if (!closestTower) {
        return;
      }

      if (this.collision.collidesWithObjects.length) {
        this.targetPoint = null;
        this.movement.stop();
      } else {
        this.targetPoint = closestTower;
      }
    },
  };
}
