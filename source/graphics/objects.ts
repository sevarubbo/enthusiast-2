import { drawHealthBar } from "./healthbar";
import { drawCircle } from "services/canvas";
import { vector } from "services/vector";
import type { State } from "services/state";
import type { StateObject } from "types";

function drawObjectAsCircle(ctx: CanvasRenderingContext2D, state: State, object: StateObject) {
  return drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    ...object,
  });
}

function drawObject(ctx: CanvasRenderingContext2D, state: State, object: StateObject) {
  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),
      vector.create(0, -object.radius - 10),
    );

    drawHealthBar(ctx, healthBarPosition, object.health.current, object.health.max);
  }

  switch (object.type) {
    case "enemy": {
      // Draw next point
      if (object.targetPoint) {
        drawCircle(ctx, {
          position: state.cameraManager.toScreen(object.targetPoint),
          color: "#aaa",
          radius: 2,
        });
      }

      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      return;
    }

    case "tower": {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      const directionPointPosition = vector.scale(vector.fromAngle(object.angle), 10);

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(vector.add(object, directionPointPosition)),
        color: "#fff",
        radius: 5,
      });

      return;
    }

    case "bullet": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "house": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "enemyB": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }
  }
}

export function drawObjects(
  ctx: CanvasRenderingContext2D,
  state: State,
  objects: State["gameObjectsManager"]["objects"],
) {
  for (const objectId in objects) {
    const object = objects[objectId];

    if (state.cameraManager.isWithinFrame(state.cameraManager.toScreen(object))) {
      drawObject(ctx, state, object);
    }
  }
}
