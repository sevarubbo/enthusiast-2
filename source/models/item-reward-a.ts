import { createBaseObject } from "./helpers";
import { getSoundProperties, playSound } from "services/audio";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
  type State,
} from "services/state";
import type { Vector } from "services/vector";

export const createItemRewardA = (position: Vector) => {
  return {
    ...createBaseObject(position),
    type: "item_reward_a",
    collisionCircle: {
      radius: 15,
    },
    collision: createObjectCollisionManager({
      circleRadius: 15,
    }),
    health: createObjectHealthManager({ maxHealth: 50 }),

    icon: ["🥥", "🍉", "🍇", "🥑"][Math.floor(Math.random() * 4)] as string,

    update(delta: number, state: State) {
      this.health.update(delta, state, this);

      const collidesWith = this.collision.collidesWithObjects[0];

      if (!collidesWith) return;

      let shouldDespawn = false;

      if (
        "health" in collidesWith &&
        collidesWith.health.current < collidesWith.health.max
      ) {
        collidesWith.health.increase(
          collidesWith.health.max - collidesWith.health.current,
        );
        shouldDespawn = true;
      }

      if (
        "shield" in collidesWith &&
        collidesWith.shield.hp < collidesWith.shield.maxHp
      ) {
        collidesWith.shield.hp = collidesWith.shield.maxHp;
        shouldDespawn = true;
      }

      if (
        "weapon" in collidesWith &&
        collidesWith.weapon.ammo < collidesWith.weapon.maxAmmo
      ) {
        collidesWith.weapon.ammo = collidesWith.weapon.maxAmmo;
        shouldDespawn = true;
      }

      if (shouldDespawn) {
        state.gameObjectsManager.despawnObject(this);
        playSound("coin chime", getSoundProperties(this, state.cameraManager));
      }

      if (collidesWith.type === "stranger_a") {
        state.statsManager.addMoney(1);
      }
    },
  } as const;
};
