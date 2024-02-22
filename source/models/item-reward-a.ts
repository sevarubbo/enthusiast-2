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
    collision: createObjectCollisionManager(),
    health: createObjectHealthManager({ maxHealth: 5 }),

    icon: ["🥥", "🍉", "🍇", "🥑"][Math.floor(Math.random() * 4)] as string,

    update(delta: number, state: State) {
      this.health.update(delta, state, this);

      if (this.collision.collidesWithObjects[0]?.type === "stranger_a") {
        state.gameObjectsManager.despawnObject(this);

        state.statsManager.addMoney(1);

        playSound("coin chime", {
          volume: 0.3,
        });
      }
    },
  } as const;
};
