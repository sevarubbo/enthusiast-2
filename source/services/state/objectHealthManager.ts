import { createIntervalManager } from "./intervalManager";
import { getSoundPosition, playSound } from "services/audio";
import type { IntervalManager } from "./intervalManager";
import type { State } from "./types";
import type { SoundName } from "services/audio";
import type { StateObject } from "types";

export interface ObjectHealthManager {
  max: number;
  current: number;
  healInterval: IntervalManager | null;
  decrease(value: number): void;
  update(delta: number, state: State, object: StateObject): void;
}

export const createObjectHealthManager = (o: {
  maxHealth: number;
  selfHealing?: boolean;
  deathSound?: SoundName | null;
}): ObjectHealthManager => ({
  max: o.maxHealth,
  current: o.maxHealth,
  healInterval: o.selfHealing ? createIntervalManager(2000) : null,
  decrease(value: number) {
    this.current = Math.max(0, this.current - value);
  },
  update(delta, state, object) {
    this.healInterval?.update(delta, state);

    // Healing
    this.healInterval?.fireIfReady(() => {
      const healingValue = this.max / 50;

      this.current = Math.min((this.current += healingValue), this.max);
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
});
