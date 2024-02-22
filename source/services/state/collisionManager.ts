import { matrix } from "../matrix";
import { vector } from "../vector";
import type { State } from "./types";

export const createCollisionManager = () => {
  return {
    update(delta: number, state: State) {
      const { gameObjectsManager, quadtree } = state;

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
              const vectorBetween = vector.subtract(nearbyObject, object);
              const distance = vector.length(vectorBetween);

              if (
                distance <=
                object.collisionCircle.radius +
                  nearbyObject.collisionCircle.radius
              ) {
                object.collision.collidesWithObjects.push(nearbyObject);

                // Check for collisions
                if ("collision" in object) {
                  const otherObject = nearbyObject;

                  // Move the object back to the edge of the collision
                  const overlap =
                    object.collisionCircle.radius +
                    nearbyObject.collisionCircle.radius -
                    distance;
                  const direction = vector.normalize(vectorBetween);
                  const offset =
                    (overlap * otherObject.collisionCircle.radius) /
                    (otherObject.collisionCircle.radius +
                      object.collisionCircle.radius);

                  if ("setPosition" in object) {
                    const newPosition = matrix.fitPoint(
                      {
                        x: object.x - direction.x * offset,
                        y: object.y - direction.y * offset,
                      },
                      matrix.create(
                        object.collisionCircle.radius,
                        object.collisionCircle.radius,
                        state.world.size.x - object.collisionCircle.radius,
                        state.world.size.y - object.collisionCircle.radius,
                      ),
                    );

                    object.setPosition(newPosition);
                  } else {
                    const newPosition = matrix.fitPoint(
                      {
                        x: object.x - direction.x * offset,
                        y: object.y - direction.y * offset,
                      },
                      matrix.create(
                        object.collisionCircle.radius,
                        object.collisionCircle.radius,
                        state.world.size.x - object.collisionCircle.radius,
                        state.world.size.y - object.collisionCircle.radius,
                      ),
                    );

                    object.x = newPosition.x;
                    object.y = newPosition.y;
                  }
                }
              }
            }
          }
        }
      });
    },
  };
};
