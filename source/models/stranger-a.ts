import { createId } from "helpers";
import { createObjectHealthManager, type Collidable, type Identifiable, type Movable, type ObjectHealthManager, type Updatable, createObjectMovementManager } from "services/state";
import { vector, type Vector } from "services/vector";

export interface StrangerA extends Identifiable, Updatable, Collidable, Movable {
  type: "enemyC";
  color: "green";
  radius: 12;
  targetPoint?: Vector;
  health: ObjectHealthManager;
}

export function createStrangerA(o: Partial<Pick<StrangerA, "x" | "y">> = {}): StrangerA {
  return {
    id: createId(),
    type: "enemyC",
    x: o.x || 0,
    y: o.y || 0,
    color: "green",
    radius: 12,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager(10),

    movement: createObjectMovementManager({ maxSpeed: 0.1 }),

    update(delta, getState) {
      this.movement.update(delta, getState, this);
      this.health.update(delta, getState, this);
    },

  };
}
