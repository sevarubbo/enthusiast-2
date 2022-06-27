import { createId } from "helpers";
import { createObjectMovementManager, createObjectHealthManager } from "services/state";
import { vector } from "services/vector";
import type { Tower } from "./tower";
import type { ObjectHealthManager, Collidable, Identifiable, Updatable, Movable } from "services/state";
import type { Vector } from "services/vector";

export interface EnemyB extends Identifiable, Updatable, Vector, Collidable, Movable {
  type: "enemyB";
  color: "pink";
  radius: 10;
  targetPoint?: Vector;
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
    health: createObjectHealthManager(10),
    movement: createObjectMovementManager({ maxSpeed: 0.1 }),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      const { gameObjectsManager } = getState();

      // Find first tower
      const towers = gameObjectsManager.findObjectsByType<Tower>("tower");
      const firstTower = towers.length ? towers[0] : null;

      if (!firstTower) {
        return;
      }

      this.targetPoint = firstTower;

      const d = vector.distance(this, this.targetPoint);

      if (d < this.movement.realSpeed) {
        this.x = this.targetPoint.x;
        this.y = this.targetPoint.y;
        this.movement.stop();

        return;
      }

      this.movement.direction = vector.direction(this, this.targetPoint);
    },
  };
}
