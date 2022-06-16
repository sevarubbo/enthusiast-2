import type { Updatable } from "./types";
import type { StateObject } from "types";

export interface GameObjectsManager extends Updatable {
  objects: Record<string, StateObject>;
  spawnObject(object: StateObject): void;
}

export const createGameObjectsManager = (
  o: Partial<Pick<GameObjectsManager, "objects" | "update">>,
): GameObjectsManager => ({
  objects: o.objects || {},

  spawnObject(object) {
    this.objects[object.id] = object;
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

    if (o.update) {
      o.update(delta, getState);
    }
  },
});
