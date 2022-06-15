import type { Vector } from "../services/vector";
import type { GameState, StateObject } from "types";

function drawCircle(ctx: CanvasRenderingContext2D, o: { position: Vector; radius: number; color: string }) {
  ctx.beginPath();
  ctx.arc(o.position.x, o.position.y, o.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = o.color;
  ctx.fill();
  ctx.closePath();
}

function drawRectangle(ctx: CanvasRenderingContext2D, o: { position: Vector; width: number; height: number }) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fff";

  ctx.strokeRect(o.position.x, o.position.y, o.width, o.height);
}

function drawObject(ctx: CanvasRenderingContext2D, state: GameState, object: StateObject) {
  switch (object.type) {
    case "circle": {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      return;
    }

    case "triangle": {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      // Draw next point
      if (object.targetPoint) {
        drawCircle(ctx, {
          position: state.cameraManager.toScreen(object.targetPoint),
          color: "#fff",
          radius: 5,
        });
      }

      return;
    }
  }
}

function drawObjects(ctx: CanvasRenderingContext2D, state: GameState, objects: GameState["objects"]) {
  for (const objectId in objects) {
    const object = objects[objectId];

    drawObject(ctx, state, object);
  }
}

export function createCanvasDrawer(ctx: CanvasRenderingContext2D) {
  return {
    draw: (state: GameState) => {
      drawObjects(ctx, state, state.objects);

      // Draw world pane
      drawRectangle(ctx, {
        position: state.cameraManager.toScreen({ x: 0, y: 0 }),
        width: state.world.size.x,
        height: state.world.size.y,
      });
    },
  } as const;
}
