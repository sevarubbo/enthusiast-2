import type { createQuadtree } from "../quadtree";
import type { Updatable } from "./types";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export interface GameObjectsManager extends Updatable {
  objects: Record<string, StateObject>;
  spawnObject(object: StateObject): void;
  despawnObject(object: StateObject): void;
  getObject(id: string): StateObject;
  findClosestObject(
    point: Vector,
    filter: (object: StateObject) => boolean,
  ): StateObject | null;
  findObjectsByType<T extends StateObject>(type: T["type"]): T[];
}

export const createGameObjectsManager = (
  options: Partial<Pick<GameObjectsManager, "update">> & {
    objectsArray?: StateObject[];
    quadtree: ReturnType<typeof createQuadtree>;
  },
): GameObjectsManager => {
  let newObjects = {};

  if (options.objectsArray) {
    newObjects = options.objectsArray.reduce(
      (prev, object) => ({
        ...prev,
        [object.id]: object,
      }),
      {},
    );
  }

  return {
    objects: newObjects,

    spawnObject(object) {
      this.objects[object.id] = object;
    },

    despawnObject(object) {
      options.quadtree.remove(object);
      delete this.objects[object.id];
    },

    findObjectsByType<T extends StateObject>(type: StateObject["type"]) {
      const res: T[] = [];

      for (const id in this.objects) {
        const object = this.objects[id];

        if (object && object.type === type) {
          res.push(object as T);
        }
      }

      return res;
    },

    findClosestObject(point: Vector, filter: (object: StateObject) => boolean) {
      let closestObject: StateObject | null = null;
      let closestDistance = Infinity;
      const RADIUS = 1000;
      const objects = options.quadtree.queryRadius(point, RADIUS);

      for (const object of objects) {
        if (filter(object)) {
          const distance = Math.sqrt(
            (point.x - object.x) ** 2 + (point.y - object.y) ** 2,
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestObject = object;
          }
        }
      }

      return closestObject;
    },

    getObject(id) {
      const object = this.objects[id];

      if (!object) {
        throw new Error(`Object with id ${id} not found`);
      }

      return object;
    },

    update(delta, getState) {
      const state = getState();

      if (state.gameSpeedManager.gameSpeed > 0) {
        for (const objectId in this.objects) {
          const object = this.objects[objectId];

          if (object && "update" in object) {
            object.update(delta, () => state);
          }
        }
      }

      if (options.update) {
        options.update(delta, getState);
      }
    },
  };
};
