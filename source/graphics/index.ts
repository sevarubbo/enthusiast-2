import type { Vector } from "../services/vector";
import type { State } from "services/state";
import type { StateObject } from "types";

function drawCircle(ctx: CanvasRenderingContext2D, o: { position: Vector; radius: number; color: string }) {
  ctx.beginPath();
  ctx.arc(o.position.x, o.position.y, o.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = o.color;
  ctx.fill();
  ctx.closePath();
}

function drawRectangle(ctx: CanvasRenderingContext2D, o: { position: Vector; size: Vector }) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333";

  ctx.strokeRect(o.position.x, o.position.y, o.size.x, o.size.y);
}

function drawObject(ctx: CanvasRenderingContext2D, state: State, object: StateObject) {
  switch (object.type) {
    case "circle": {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      return;
    }

    case "enemy": {
      // Draw next point
      if (object.targetPoint) {
        drawCircle(ctx, {
          position: state.cameraManager.toScreen(object.targetPoint),
          color: "#fff",
          radius: 3,
        });
      }

      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      return;
    }
  }
}

function drawObjects(
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

export function createCanvasDrawer(ctx: CanvasRenderingContext2D) {
  return {
    draw: (state: State) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw world pane
      drawRectangle(ctx, {
        position: state.cameraManager.toScreen({ x: 0, y: 0 }),
        size: state.world.size,
      });

      // Draw camera frame
      drawRectangle(ctx, {
        position: state.cameraManager.frame.position,
        size: state.cameraManager.frame.size,
      });

      // Draw objects
      drawObjects(ctx, state, state.gameObjectsManager.objects);
    },
  } as const;
}
