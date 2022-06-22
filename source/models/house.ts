import { createId } from "helpers";
import type { Collidable, Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 30;

export interface House extends Identifiable, Updatable, Vector, Collidable {
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
    ...o,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta, getState) {
      //
    },
  };
}
