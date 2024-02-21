import { createId } from "../helpers";
import { getSoundPosition, playSound } from "../services/audio";
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
  collisionCircle: { radius: 15 },
  collision: createObjectCollisionManager(),
  x: o.x,
  y: o.y,

  update(delta, state) {
    this.collision.update(delta, state, this);
    // If collides with player, give shield
    const collidesWith = this.collision.collidesWithObjects[0];

    if (collidesWith && "shield" in collidesWith) {
      if (
        !collidesWith.shield.active ||
        collidesWith.shield.hp < collidesWith.shield.maxHp
      ) {
        collidesWith.shield.active = true;
        collidesWith.shield.hp = collidesWith.shield.maxHp;
        state.gameObjectsManager.despawnObject(this);
        playSound(
          "shield acquired",
          getSoundPosition(this, state.cameraManager),
        );
      }
    }
  },
});
