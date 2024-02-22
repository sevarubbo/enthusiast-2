import { createBaseObject } from "./helpers";
import { createMachineGunB } from "./weapon-a";
import { getSoundProperties, playSound } from "services/audio";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type { State } from "services/state";
import type { Vector } from "services/vector";

export const createWeaponAItem = (position: Vector) =>
  ({
    ...createBaseObject(position),
    type: "weapon_a_item",
    color: "blue",
    collisionCircle: { radius: 15 },
    collision: createObjectCollisionManager(),
    health: createObjectHealthManager({ maxHealth: 50 }),

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      this.collision.update(delta, state, this);
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
          collidesWith.weapon = createMachineGunB();
          playSound(
            "weapon pick",
            getSoundProperties(this, state.cameraManager),
          );
          state.gameObjectsManager.despawnObject(this);
        }
      }
    },
  }) as const;
