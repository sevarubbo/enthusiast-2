import { createId } from "helpers";
import {
  createObjectCollisionManager,
  type Collidable,
  type Identifiable,
  type Updatable,
} from "services/state";

export interface Well extends Identifiable, Updatable, Collidable {
  type: "well";
  energyLevel: number;
}

const MAX_ENERGY_LEVEL = 100;

export function createWell(o: Partial<Pick<Well, "x" | "y">> = {}): Well {
  return {
    id: createId(),
    type: "well",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 20 },
    collision: createObjectCollisionManager(),
    energyLevel: MAX_ENERGY_LEVEL,

    update() {
      // Well does not update
    },
  };
}
