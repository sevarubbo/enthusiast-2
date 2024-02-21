import { createId } from "helpers";
import { playSound } from "services/audio";
import { createObjectCollisionManager, type State } from "services/state";
import type { Vector } from "services/vector";

export const createItemRewardA = (position: Vector) => {
  let x = position.x;
  let y = position.y;

  return {
    id: createId(),
    type: "item_reward_a",
    collisionCircle: {
      radius: 15,
    },
    collision: createObjectCollisionManager(),

    icon: ["🥥", "🍉", "🍇", "🥑"][Math.floor(Math.random() * 4)] as string,

    setPosition(p: Vector) {
      x = p.x;
      y = p.y;
    },

    get x() {
      return x;
    },

    get y() {
      return y;
    },

    update(delta: number, state: State) {
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
