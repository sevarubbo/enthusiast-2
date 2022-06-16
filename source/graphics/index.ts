import { drawObjects } from "./objects";
import type { Vector } from "../services/vector";
import type { State } from "services/state";

function drawRectangle(ctx: CanvasRenderingContext2D, o: { position: Vector; size: Vector }) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333";

  ctx.strokeRect(o.position.x, o.position.y, o.size.x, o.size.y);
}

function drawUI(
  ctx: CanvasRenderingContext2D,
  state: State,
) {
  ctx.fillStyle = "#fff";
  ctx.font = "48px serif";

  const n = Object.keys(state.gameObjectsManager.objects).length;

  ctx.fillText(`${n}`, 100, 100);
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

      // Draw UI
      drawUI(ctx, state);
    },
  } as const;
}
