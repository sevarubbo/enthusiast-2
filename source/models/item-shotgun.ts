import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createShotgun } from "./weapon-a";
import { playSound, getSoundProperties } from "services/audio";
import { createObjectHealthManager } from "services/state";
import type { State } from "services/state";
import type { Vector } from "services/vector";

export const createItemShotgun = (position: Vector) => {
  return {
    ...createBaseObject(position),
    type: "item_shotgun",
    icon: "🔪",

    collision: createObjectCollisionManager({
      circleRadius: 20,
    }),

    health: createObjectHealthManager({ maxHealth: 50 }),

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      // If collides with player, give weapon
      const collidesWith = this.collision.collidesWithObjects[0];

      if (!collidesWith) return;

      if (!("weapon" in collidesWith)) return;

      if (
        collidesWith.type === "stranger_a" ||
        collidesWith.type === "defender_a" ||
        collidesWith.type === "shooting_enemy_a"
      ) {
        if (
          collidesWith.weapon.type === "default" ||
          collidesWith.weapon.ammo < collidesWith.weapon.maxAmmo
        ) {
          collidesWith.weapon = createShotgun();
          playSound(
            "weapon pick",
            getSoundProperties(this, state.cameraManager),
          );
          state.gameObjectsManager.despawnObject(this);
        }
      }
    },
  } as const;
};
