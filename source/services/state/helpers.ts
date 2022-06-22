import { circle } from "services/circle";
import type { Matrix } from "services/matrix";
import type { State } from "services/state";
import type { StateObject } from "types";

export function getFirstObjectLineCollision(getState: () => State, line: Matrix): StateObject | null {
  const { gameObjectsManager } = getState();

  for (const otherObjectId in gameObjectsManager.objects) {
    const otherObject = gameObjectsManager.objects[otherObjectId];

    if (
      otherObject.type !== "house"
    ) {
      continue;
    }

    if (!("collisionCircle" in otherObject)) {
      continue;
    }

    const collisionCircle = {
      x: otherObject.x,
      y: otherObject.y,
      radius: otherObject.collisionCircle.radius,
    };

    if (circle.collidesWithLine(collisionCircle, line)) {
      return otherObject;
    }
  }

  return null;
}
