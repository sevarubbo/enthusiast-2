import type { State } from "services/state";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

function drawCircle(ctx: CanvasRenderingContext2D, o: { position: Vector; radius: number; color: string }) {
  ctx.beginPath();
  ctx.arc(o.position.x, o.position.y, o.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = o.color;
  ctx.fill();
  ctx.closePath();
}

function drawObject(ctx: CanvasRenderingContext2D, state: State, object: StateObject) {
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
