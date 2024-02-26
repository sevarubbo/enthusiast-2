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
    radius?: number,
  ): StateObject | null;
  findObjectsByType<T extends StateObject>(type: T["type"]): T[];
  findClosestObjectByType<T extends StateObject>(
    point: Vector,
    type: T["type"],
    radius?: number,
  ): T | null;
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

    findClosestObject(
      point: Vector,
      filter: (object: StateObject) => boolean,
      radius = 1000,
    ) {
      let closestObject: StateObject | null = null;
      let closestDistance = Infinity;
      const objects = options.quadtree
        .queryRadius(point, radius)
        .filter(filter);

      for (const object of objects) {
        const distanceSquared =
          (point.x - object.x) ** 2 + (point.y - object.y) ** 2;

        if (distanceSquared < closestDistance) {
          closestDistance = distanceSquared;
          closestObject = object;
        }
      }

      return closestObject;
    },

    findClosestObjectByType<T extends StateObject>(
      point: Vector,
      type: T["type"],
      radius = 1000,
    ) {
      return this.findClosestObject(
        point,
        (object) => object.type === type,
        radius,
      ) as T;
    },

    getObject(id) {
      const object = this.objects[id];

      if (!object) {
        throw new Error(`Object with id ${id} not found`);
      }

      return object;
    },

    update(delta, state) {
      if (state.gameSpeedManager.gameSpeed > 0) {
        for (const objectId in this.objects) {
          const object = this.objects[objectId];

          if (object && "update" in object) {
            object.update(delta, state);
          }
        }
      }

      if (options.update) {
        options.update(delta, state);
      }
    },
  };
};
