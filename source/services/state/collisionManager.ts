import { vector } from "../vector";
import type { State } from "./types";

export const createCollisionManager = () => {
  return {
    update(delta: number, getState: () => State) {
      const { gameObjectsManager, quadtree } = getState();

      quadtree.clear();

      Object.values(gameObjectsManager.objects).forEach((object) => {
        if ("collisionCircle" in object) {
          quadtree.insert(object);
        }
      });

      Object.values(gameObjectsManager.objects).forEach((object) => {
        if ("collisionCircle" in object) {
          const nearbyObjects = (() => {
            const SCALE = 10;

            if ("movement" in object) {
              return quadtree.queryRadius(
                object,
                object.collisionCircle.radius * SCALE,
              );
            }

            return quadtree.queryRadius(
              object,
              object.collisionCircle.radius * SCALE,
            );
          })();

          object.collision.collidesWithObjects = [];

          for (const nearbyObject of nearbyObjects) {
            if (nearbyObject !== object) {
              const distance = Math.sqrt(
                (object.x - nearbyObject.x) ** 2 +
                  (object.y - nearbyObject.y) ** 2,
              );

              if (
                distance <
                object.collisionCircle.radius +
                  nearbyObject.collisionCircle.radius
              ) {
                object.collision.collidesWithObjects.push(nearbyObject);

                // Check for collisions
                if ("collision" in object) {
                  const otherObject = nearbyObject;

                  let direction;

                  if ("movement" in object) {
                    direction = Math.atan2(
                      object.y + object.movement.speedVector.y - otherObject.y,
                      object.x + object.movement.speedVector.x - otherObject.x,
                    );
                  } else {
                    direction = Math.atan2(
                      object.y - otherObject.y,
                      object.x - otherObject.x,
                    );
                  }

                  const moveStep = vector.scale(vector.fromAngle(direction), 1);

                  // Move the object away from the other object, via setting x and y
                  object.x += moveStep.x;
                  object.y += moveStep.y;
                }
              }
            }
          }
        }
      });
    },
  };
};
