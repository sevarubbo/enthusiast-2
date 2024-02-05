import { createIntervalManager } from "./intervalManager";
import type { IntervalManager } from "./intervalManager";
import type { State } from "./types";
import type { StateObject } from "types";

export interface ObjectHealthManager {
  max: number;
  current: number;
  healInterval: IntervalManager | null;
  decrease(value: number): void;
  update(delta: number, getState: () => State, object: StateObject): void;
}

export const createObjectHealthManager = (o: {
  maxHealth: number;
  selfHealing?: boolean;
}): ObjectHealthManager => ({
  max: o.maxHealth,
  current: o.maxHealth,
  healInterval: o.selfHealing ? createIntervalManager(2000) : null,
  decrease(value: number) {
    this.current = Math.max(0, this.current - value);
  },
  update(delta, getState, object) {
    this.healInterval?.update(delta, getState);

    // Healing
    this.healInterval?.fireIfReady(() => {
      this.current = Math.min((this.current += 1), this.max);
    });

    // Dying
    if (this.current <= 0) {
      getState().gameObjectsManager.despawnObject(object);
    }
  },
});
