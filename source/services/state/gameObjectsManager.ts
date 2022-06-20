import type { Updatable } from "./types";
import type { StateObject } from "types";

export interface GameObjectsManager extends Updatable {
  objects: Record<string, StateObject>;
  spawnObject(object: StateObject): void;
  despawnObject(object: StateObject): void;
  forEachObject(callback: (object: StateObject) => void): void;
}

export const createGameObjectsManager = (
  options: Partial<Pick<GameObjectsManager, "objects" | "update">>,
): GameObjectsManager => ({
  objects: options.objects || {},

  spawnObject(object) {
    this.objects[object.id] = object;
  },

  despawnObject(object) {
    delete this.objects[object.id];
  },

  update(delta, getState) {
    const state = getState();

    if (state.gameSpeedManager.gameSpeed > 0) {
      for (const objectId in this.objects) {
        const object = this.objects[objectId];

        if ("update" in object) {
          object.update(delta, () => state);
        }
      }
    }

    if (options.update) {
      options.update(delta, getState);
    }
  },
});
