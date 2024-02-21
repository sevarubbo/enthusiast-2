import { createId } from "helpers";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type {
  Collidable,
  Identifiable,
  Updatable,
  Healthy,
} from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 30;

export interface House
  extends Identifiable,
    Updatable,
    Vector,
    Collidable,
    Healthy {
  type: "house";
  color: "blue";
  radius: typeof RADIUS;
}

export function createHouse(o: Pick<House, "x" | "y">): House {
  return {
    id: createId(),
    type: "house",
    color: "blue",
    radius: RADIUS,
    collisionCircle: { radius: RADIUS },
    health: createObjectHealthManager({
      maxHealth: 100,
      selfHealing: true,
    }),
    collision: createObjectCollisionManager(),
    ...o,

    update(delta, state) {
      this.health.update(delta, state, this);
    },
  };
}
