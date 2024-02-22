import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createIntervalManager } from "../services/state";
import type { State } from "../services/state";
import type { Vector } from "../services/vector";

const HEAL_AMOUNT = 2;

export const createHealingStationA = (position: Vector) => {
  let color = "#030";

  return {
    ...createBaseObject(position),
    type: "healing_station_a",

    collisionCircle: { radius: 100 },
    collision: createObjectCollisionManager({
      isSolid: false,
    }),
    healInterval: createIntervalManager(1000),

    get color() {
      return color;
    },
    setColor(c: string) {
      color = c;
    },

    update(delta: number, state: State) {
      this.healInterval.update(delta, state);

      const collidingObjects = this.collision.collidesWithObjects;

      if (collidingObjects.find((o) => "health" in o)) {
        this.setColor("#080");
      } else {
        this.setColor("#030");
      }

      this.healInterval.fireIfReady(() => {
        for (const object of collidingObjects) {
          if ("health" in object) {
            object.health.increase(HEAL_AMOUNT / collidingObjects.length);
          }
        }
      });
    },
  } as const;
};
