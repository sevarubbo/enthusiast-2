import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createIntervalManager } from "services/state";
import type { State } from "services/state";
import type { Vector } from "services/vector";

export type SlashingElement = ReturnType<typeof createSlashingElement>;

export const createSlashingElement = (position: Vector, owner: unknown) => {
  return {
    ...createBaseObject(position),
    type: "slashing_element" as const,
    color: "#fff",
    collision: createObjectCollisionManager({
      circleRadius: 5,
      ignoreCollisions: new Set([owner]),
    }),
    attack: 10,
    attackInterval: createIntervalManager(100, false),

    update(delta: number, state: State) {
      this.attackInterval.update(delta);
      const collidesWith = this.collision.collidesWithObjects;

      for (const otherObject of collidesWith) {
        if (otherObject === owner) continue;

        this.attackInterval.fireIfReady(() => {
          if ("shield" in otherObject && otherObject.shield.active) {
            otherObject.shield.absorbDamage(this.attack, this, state);
          } else if ("health" in otherObject) {
            otherObject.health.decrease(this.attack, otherObject, state);
          }
        });
      }
    },
  };
};
