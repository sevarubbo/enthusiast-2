import type { Collidable, State } from "./types";
import type { StateObject } from "types";

export interface ObjectCollisionManager {
  collidesWithObjects: Array<StateObject & Collidable>;
  update(delta: number, getState: () => State, object: Collidable): void;
}

export const createObjectCollisionManager = (
  checkForCollisions = true,
): ObjectCollisionManager => ({
  collidesWithObjects: [],
  update(delta, getState, object) {
    const state = getState();

    // Remove destroyed objects from the list
    this.collidesWithObjects = this.collidesWithObjects.filter(
      (o) => o.id in state.gameObjectsManager.objects,
    );

    if (checkForCollisions) {
      for (const id in state.gameObjectsManager.objects) {
        const otherObject = state.gameObjectsManager.objects[id];

        if (!otherObject || otherObject === object) {
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
          const direction = Math.atan2(
            object.y - otherObject.y,
            object.x - otherObject.x,
          );

          object.x += Math.cos(direction);
          object.y += Math.sin(direction);
        } else {
          this.collidesWithObjects = this.collidesWithObjects.filter(
            (o) => o !== otherObject,
          );
        }
      }
    }
  },
});
