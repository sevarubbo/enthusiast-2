import { createId } from "helpers";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
  type Collidable,
  type Healthy,
  type IntervalManager,
  type Movable,
} from "services/state";

export interface DefenderA extends Movable, Collidable, Healthy {
  type: "defender_a";
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
}

export function createDefenderA(
  o: Partial<Pick<DefenderA, "x" | "y">> = {},
): DefenderA {
  return {
    color: "#a50",
    id: createId(),
    type: "defender_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.04 }),
    collision: createObjectCollisionManager(),
    targetPoint: null,
    shootingInterval: createIntervalManager(1000 / 1),
    shootingRange: 300,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // Find closest stranger
      const closestStranger = getState().gameObjectsManager.findClosestObject(
        this,
        (oo) => oo.type === "stranger_a",
      );

      if (closestStranger) {
        const distance = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        this.targetPoint = {
          x: closestStranger.x,
          y: closestStranger.y,
        };

        if (distance < this.shootingRange) {
          this.targetPoint = null;
          this.movement.stop();
        }
      }
    },
  };
}
