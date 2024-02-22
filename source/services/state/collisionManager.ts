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

      Object.values(gameObjectsManager.objects).forEach((object) => {
        object.collision.collidesWithObjects = [];

        if ("collisionCircle" in object) {
          const nearbyObjects = (() => {
            return quadtree.query(object.collision.getRec(object));
          })();

          for (const nearbyObject of nearbyObjects) {
            if (nearbyObject !== object) {
              const vectorBetween = vector.subtract(nearbyObject, object);
              const distance = vector.length(vectorBetween);

              if (!("collisionCircle" in nearbyObject)) {
                // Check if object.collisionsCircle intersects with nearbyObject.box
                const closestPoint = getCircleIntersectionWithBox(
                  {
                    position: object,
                    radius: object.collisionCircle.radius,
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

                if (distanceToClosestPoint <= object.collisionCircle.radius) {
                  object.collision.collidesWithObjects.push(nearbyObject);
                }

                // Adjust positions
                if (nearbyObject.collision.isSolid) {
                  // Move the object back to the edge of the collision
                  const overlap =
                    object.collisionCircle.radius - distanceToClosestPoint;
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

                  nearbyObject.setPosition({
                    x: nearbyObject.x + (direction.x * offset) / ratio,
                    y: nearbyObject.y + (direction.y * offset) / ratio,
                  });

                  fitObjectToWorld(nearbyObject, state.world.size);
                }
              } else if (
                distance <=
                object.collisionCircle.radius +
                  nearbyObject.collisionCircle.radius
              ) {
                object.collision.collidesWithObjects.push(nearbyObject);

                // Adjust positions
                if (
                  object.collision.isSolid &&
                  nearbyObject.collision.isSolid
                ) {
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
  const distanceToClosestPoint = vector.distance(circle.position, closestPoint);

  if (distanceToClosestPoint <= circle.radius) {
    return closestPoint;
  }

  return null;
};

const fitObjectToWorld = (object: StateObject, worldSize: Vector) => {
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
