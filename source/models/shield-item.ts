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
  collision: createObjectCollisionManager(true),
  x: o.x,
  y: o.y,

  update(delta, getState) {
    this.collision.update(delta, getState, this);
    // If collides with player, give shield
    const collidesWith = this.collision.collidesWithObjects[0];

    if (collidesWith && "shield" in collidesWith) {
      collidesWith.shield.active = true;
      collidesWith.shield.hp = collidesWith.shield.maxHp;
      getState().gameObjectsManager.despawnObject(this);
    }
  },
});
