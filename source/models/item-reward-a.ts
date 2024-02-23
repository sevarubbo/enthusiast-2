import { createBaseObject } from "./helpers";
import { playSound } from "services/audio";
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

      if ("health" in collidesWith) {
        collidesWith.health.increase(
          collidesWith.health.max - collidesWith.health.current,
        );
      }

      if ("shield" in collidesWith) {
        collidesWith.shield.hp = collidesWith.shield.maxHp;
      }

      if ("weapon" in collidesWith) {
        collidesWith.weapon.ammo = collidesWith.weapon.maxAmmo;
      }

      if (collidesWith.type === "stranger_a") {
        state.gameObjectsManager.despawnObject(this);

        state.statsManager.addMoney(1);

        playSound("coin chime", {
          volume: 0.3,
        });
      }
    },
  } as const;
};
