import type { StateObject } from "../../types";
import type { State } from "./types";

export interface ObjectHealthManager {
  max: number;
  current: number;
  decrease(value: number): void;
  update(object: StateObject, getState: () => State): void;
}

export const createObjectHealthManager = (maxHealth: number): ObjectHealthManager => ({
  max: maxHealth,
  current: maxHealth,
  decrease(value: number) {
    this.current = Math.max(0, this.current - value);
  },
  update(object, getState) {
    if (this.current === 0) {
      getState().gameObjectsManager.despawnObject(object);
    }
  },
});
