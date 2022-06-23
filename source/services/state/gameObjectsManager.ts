import type { Updatable } from "./types";
import type { StateObject } from "types";

export interface GameObjectsManager extends Updatable {
  objects: Record<string, StateObject>;
  spawnObject(object: StateObject): void;
  despawnObject(object: StateObject): void;

  findObjectsByType<T extends StateObject>(type: T["type"]): T[];
}

export const createGameObjectsManager = (
  options: Partial<Pick<GameObjectsManager, "objects" | "update">> & { objectsArray?: StateObject[] },
): GameObjectsManager => {
  let newObjects = {};

  if (options.objectsArray) {
    newObjects = options.objectsArray.reduce((prev, object) => ({
      ...prev,
      [object.id]: object,
    }), {});
  }

  return ({
    objects: { ...(options.objects || {}), ...newObjects },

    spawnObject(object) {
      this.objects[object.id] = object;
    },

    despawnObject(object) {
      delete this.objects[object.id];
    },

    findObjectsByType<T extends StateObject>(type: StateObject["type"]) {
      const res: T[] = [];

      for (const id in this.objects) {
        const object = this.objects[id];

        if (object.type === type) {
          res.push(object as T);
        }
      }

      return res;
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
};
