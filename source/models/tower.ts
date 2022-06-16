import { createId } from "helpers";
import type { Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

export interface Tower extends Identifiable, Updatable, Vector {
  type: "tower";
  color: "green";
  radius: 20;
}

export function createTower(o: Partial<Pick<Tower, "x" | "y">> = {}): Tower {
  return {
    id: createId(),
    type: "tower",
    x: o.x || 0,
    y: o.y || 0,
    color: "green",
    radius: 20,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta, getState) {
      //
    },
  };
}
