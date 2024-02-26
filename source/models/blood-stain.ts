import { createBaseObject } from "./helpers";
import type { State } from "../services/state";
import type { Vector } from "../services/vector";

export const createBloodStain = (position: Vector) => {
  let timeLeftToLive = 60 * 1000; //ms

  return {
    ...createBaseObject(position),
    type: "blood_stain",
    color: "rgba(255, 0, 0, 0.5)",

    timeToLive: timeLeftToLive,

    get timeLeftToLive() {
      return timeLeftToLive;
    },

    update(delta: number, state: State) {
      timeLeftToLive -= delta;

      if (timeLeftToLive <= 0) {
        state.gameObjectsManager.despawnObject(this);
      }
    },
  } as const;
};
