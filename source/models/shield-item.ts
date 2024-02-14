import { createId } from "../helpers";
import { createObjectCollisionManager } from "../services/state";
import type { Collidable, Updatable, Identifiable } from "../services/state";

export interface ShieldItem extends Collidable, Updatable, Identifiable {
  id: string;
  type: "shield_item";
  color: "blue";
}

export const createShieldItem = (
  o: Pick<ShieldItem, "x" | "y">,
): ShieldItem => ({
  id: createId(),
  type: "shield_item",
  color: "blue",
  collisionCircle: { radius: 8 },
  collision: createObjectCollisionManager(false),
  x: o.x,
  y: o.y,

  update() {
    // Do nothing
  },
});
