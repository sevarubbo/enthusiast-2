import { createId } from "helpers";
import { createObjectHealthManager } from "services/state";
import type { Collidable, Identifiable, ObjectHealthManager, Updatable } from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 30;

export interface House extends Identifiable, Updatable, Vector, Collidable {
  type: "house";
  color: "blue";
  radius: typeof RADIUS;
  health: ObjectHealthManager;
}

export function createHouse(o: Pick<House, "x" | "y">): House {
  return {
    id: createId(),
    type: "house",
    color: "blue",
    radius: RADIUS,
    collisionCircle: { radius: RADIUS },
    health: createObjectHealthManager(10),
    ...o,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta, getState) {
      //
    },
  };
}
