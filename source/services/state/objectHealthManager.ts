import { createIntervalManager } from "./intervalManager";
import { getSoundPosition, playSound } from "services/audio";
import type { IntervalManager } from "./intervalManager";
import type { State } from "./types";
import type { SoundName } from "services/audio";
import type { StateObject } from "types";

export interface ObjectHealthManager {
  max: number;
  readonly current: number;
  healInterval: IntervalManager | null;
  decrease(value: number, owner: StateObject, state: State): void;
  update(delta: number, state: State, object: StateObject): void;
  increase(value: number): void;
}

export const createObjectHealthManager = (o: {
  maxHealth: number;
  selfHealing?: boolean;
  deathSound?: SoundName | null;
  woundSound?: SoundName | null;
}): ObjectHealthManager => {
  let current = o.maxHealth;

  return {
    max: o.maxHealth,
    healInterval: o.selfHealing ? createIntervalManager(1000) : null,

    get current() {
      return current;
    },

    decrease(value, object, state) {
      current = Math.max(0, this.current - value);

      if (o.woundSound && current <= this.max / 2) {
        playSound(o.woundSound, getSoundPosition(object, state.cameraManager));
      }
    },
    increase(value: number) {
      current = Math.min(this.max, this.current + value);
    },

    update(delta, state, object) {
      this.healInterval?.update(delta, state);

      // Healing
      this.healInterval?.fireIfReady(() => {
        const healingValue = this.max / 200;

        current = Math.min((current += healingValue), this.max);
      });

      // Dying
      if (this.current <= 0) {
        state.gameObjectsManager.despawnObject(object);

        if (o.deathSound !== null) {
          playSound(
            o.deathSound || "basic death",
            getSoundPosition(object, state.cameraManager),
          );
        }
      }
    },
  };
};
