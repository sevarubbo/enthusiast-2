import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Collidable,
  type Identifiable,
  type Movable,
  type ObjectHealthManager,
  type Updatable,
  createObjectMovementManager,
} from "services/state";
import { type Vector } from "services/vector";

type TypicalObject = Identifiable & Updatable & Collidable & Movable;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  targetPoint?: Vector;
  health: ObjectHealthManager;
}

export function createStrangerA(
  o: Partial<Pick<StrangerA, "x" | "y">> = {},
): StrangerA {
  return {
    id: createId(),
    type: "stranger_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager(10),

    movement: createObjectMovementManager({ maxSpeed: 0.1 }),

    update(delta, getState) {
      this.movement.update(delta, getState, this);
      this.health.update(delta, getState, this);
    },
  };
}
