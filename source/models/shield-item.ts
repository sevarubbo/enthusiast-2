import { createId } from "../helpers";
import { getSoundPosition, playSound } from "../services/audio";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type {
  Updatable,
  Identifiable,
  CollidableCircle,
} from "../services/state";

export interface ShieldItem extends CollidableCircle, Updatable, Identifiable {
  id: string;
  type: "shield_item";
  color: "blue";
  health: ReturnType<typeof createObjectHealthManager>;
}

export const createShieldItem = (
  o: Pick<ShieldItem, "x" | "y">,
): ShieldItem => ({
  id: createId(),
  type: "shield_item",
  color: "blue",
  collisionCircle: { radius: 15 },
  collision: createObjectCollisionManager({
    circleRadius: 15,
  }),
  health: createObjectHealthManager({ maxHealth: 200 }),
  x: o.x,
  y: o.y,

  update(delta, state) {
    this.health.update(delta, state, this);
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
