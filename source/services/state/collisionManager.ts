import { matrix } from "../matrix";
import { vector } from "../vector";
import type { StateObject } from "../../types";
import type { Vector } from "../vector";
import type { State } from "./types";

export const createCollisionManager = () => {
  return {
    update(delta: number, state: State) {
      const { gameObjectsManager, quadtree } = state;

      quadtree.clear();

      Object.values(gameObjectsManager.objects).forEach((object) => {
        if ("collision" in object) {
          quadtree.insert(object);
        }
      });

      // Update collisions
      Object.values(gameObjectsManager.objects).forEach((object) => {
        if (!("collision" in object)) return;

        object.collision.collidesWithObjects = [];

        if ("collision" in object && "circleRadius" in object.collision) {
          const collisionCircleRadius =
            "circleRadius" in object.collision
              ? object.collision.circleRadius
              : null;

          if (!collisionCircleRadius) {
            return;
          }

          const nearbyObjects = (() => {
            return quadtree.query(object.collision.getRec(object));
          })();

          for (const nearbyObject of nearbyObjects) {
            if (!("collision" in nearbyObject)) continue;

            if (object.collision.ignoreCollisions.has(nearbyObject)) continue;
            if (nearbyObject.collision.ignoreCollisions.has(object)) continue;

            if (nearbyObject !== object) {
              const vectorBetween = vector.subtract(nearbyObject, object);
              const distance = vector.length(vectorBetween);

              if ("boxSize" in nearbyObject.collision) {
                // Check if object.collisionsCircle intersects with nearbyObject.box
                const closestPoint = getCircleIntersectionWithBox(
                  {
                    position: object,
                    radius: collisionCircleRadius,
                  },
                  nearbyObject.collision.getRec(nearbyObject),
                );

                if (!closestPoint) {
                  continue;
                }

                const distanceToClosestPoint = vector.distance(
                  object,
                  closestPoint,
                );

                if (distanceToClosestPoint <= collisionCircleRadius) {
                  object.collision.collidesWithObjects.push(nearbyObject);
                }

                // Adjust positions
                if (nearbyObject.collision.isSolid) {
                  // Move the object back to the edge of the collision
                  const overlap =
                    collisionCircleRadius - distanceToClosestPoint;
                  const direction = vector.normalize(
                    vector.subtract(closestPoint, object),
                  );
                  const offset = overlap;

                  if ("setPosition" in object) {
                    // TODO
                  } else {
                    const newPosition = {
                      x: object.x - direction.x * offset,
                      y: object.y - direction.y * offset,
                    };

                    object.x = newPosition.x;
                    object.y = newPosition.y;
                  }

                  // Move other object
                  // TODO: Calculate
                  const ratio = 3;

                  if ("setPosition" in nearbyObject) {
                    nearbyObject.setPosition({
                      x: nearbyObject.x + (direction.x * offset) / ratio,
                      y: nearbyObject.y + (direction.y * offset) / ratio,
                    });

                    fitObjectToWorld(nearbyObject, state.world.size);
                  }
                }
              } else if ("circleRadius" in nearbyObject.collision) {
                const otherCollisionCircleRadius =
                  nearbyObject.collision.circleRadius;

                if (
                  distance <=
                  collisionCircleRadius + otherCollisionCircleRadius
                ) {
                  object.collision.collidesWithObjects.push(nearbyObject);

                  // Adjust positions
                  if (
                    !object.collision.ignoreCollisions.has(nearbyObject) &&
                    !object.collision.isFixed &&
                    object.collision.isSolid &&
                    nearbyObject.collision.isSolid
                  ) {
                    // Move the object back to the edge of the collision
                    const overlap =
                      collisionCircleRadius +
                      otherCollisionCircleRadius -
                      distance;
                    const direction = vector.normalize(vectorBetween);
                    const offset =
                      (overlap * otherCollisionCircleRadius) /
                      (otherCollisionCircleRadius + collisionCircleRadius);

                    if ("setPosition" in object) {
                      const newPosition = matrix.fitPoint(
                        {
                          x: object.x - direction.x * offset,
                          y: object.y - direction.y * offset,
                        },
                        matrix.create(
                          collisionCircleRadius,
                          collisionCircleRadius,
                          state.world.size.x - collisionCircleRadius,
                          state.world.size.y - collisionCircleRadius,
                        ),
                      );

                      object.setPosition(newPosition);
                    } else {
                      const objectCollisionCircleRadius =
                        object.collision.circleRadius;

                      const newPosition = matrix.fitPoint(
                        {
                          x: object.x - direction.x * offset,
                          y: object.y - direction.y * offset,
                        },
                        matrix.create(
                          objectCollisionCircleRadius,
                          objectCollisionCircleRadius,
                          state.world.size.x - objectCollisionCircleRadius,
                          state.world.size.y - objectCollisionCircleRadius,
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
        }
      });
    },
  };
};

const getCircleIntersectionWithBox = (
  circle: {
    position: Vector;
    radius: number;
  },
  box: Vector & {
    width: number;
    height: number;
  },
) => {
  const closestPoint = {
    x: Math.max(box.x, Math.min(box.x + box.width, circle.position.x)),
    y: Math.max(box.y, Math.min(box.y + box.height, circle.position.y)),
  };
  const distanceToClosestPointSq = vector.distanceSquared(
    circle.position,
    closestPoint,
  );

  if (distanceToClosestPointSq <= circle.radius ** 2) {
    return closestPoint;
  }

  return null;
};

const fitObjectToWorld = (object: StateObject, worldSize: Vector) => {
  if (!("collision" in object)) return;

  const objectRect = object.collision.getRec(object);

  const newPosition = matrix.fitPoint(
    {
      x: object.x,
      y: object.y,
    },
    matrix.create(
      0,
      0,
      worldSize.x - objectRect.width,
      worldSize.y - objectRect.height,
    ),
  );

  if ("setPosition" in object) {
    object.setPosition(newPosition);
  } else {
    object.x = newPosition.x;
    object.y = newPosition.y;
  }
};
