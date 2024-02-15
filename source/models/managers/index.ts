import { vector } from "services/vector";
import type { createQuadtree } from "../../services/quadtree";
import type {
  Collidable,
  Identifiable,
  ObjectManager,
} from "services/state/types";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export interface ObjectCollisionManager extends ObjectManager {
  collidesWithObjects: Array<StateObject & Collidable>;
  lastObjectPosition: Vector;
}

const OLD_POINTS: Record<string, Vector & Identifiable> = {};

const updateQuadtree = (
  quadtree: ReturnType<typeof createQuadtree>,
  object: StateObject,
) => {
  const oldPoint = OLD_POINTS[object.id];

  // if (oldPoint) {
  //   quadtree.remove(oldPoint);
  // }

  quadtree.insert(object);
  // OLD_POINTS[object.id] = {
  //   id: object.id,
  //   x: object.x,
  //   y: object.y,
  // };
};

export const createObjectCollisionManager = (): ObjectCollisionManager => ({
  lastObjectPosition: vector.zero,
  collidesWithObjects: [],
  update(delta, getState, object) {
    const { quadtree } = getState();

    updateQuadtree(quadtree, object);

    // Remove destroyed objects from the list
    this.collidesWithObjects = [];

    // Get objects to check for collisions
    const objectsToCheck = quadtree.query(
      // range
      {
        x: 0,
        y: 0,
        width: getState().world.size.x,
        height: getState().world.size.y,
      },
    );

    const allObjects = Object.values(getState().gameObjectsManager.objects);

    // Check for collisions

    for (const otherObject of objectsToCheck) {
      if (otherObject === object) {
        continue;
      }

      if (!("collisionCircle" in otherObject)) {
        continue;
      }

      const distance = Math.sqrt(
        (object.x - otherObject.x) ** 2 + (object.y - otherObject.y) ** 2,
      );

      if (
        distance <=
        object.collisionCircle.radius + otherObject.collisionCircle.radius
      ) {
        this.collidesWithObjects.push(otherObject);

        if ("movement" in object) {
          const direction = Math.atan2(
            object.y + object.movement.speedVector.y - otherObject.y,
            object.x + object.movement.speedVector.x - otherObject.x,
          );

          object.x += Math.cos(direction);
          object.y += Math.sin(direction);
        } else {
          const direction = Math.atan2(
            object.y - otherObject.y,
            object.x - otherObject.x,
          );

          object.x += Math.cos(direction);
          object.y += Math.sin(direction);
        }
      }
    }
  },
});
