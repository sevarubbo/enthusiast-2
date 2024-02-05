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
    health: createObjectHealthManager(100),
    collision: createObjectCollisionManager(),
    ...o,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
    },
  };
}
