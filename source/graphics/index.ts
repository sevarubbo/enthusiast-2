import { drawObjects } from "./objects";
import type { Vector } from "../services/vector";
import type { State } from "services/state";

function drawRectangle(
  ctx: CanvasRenderingContext2D,
  o: { position: Vector; size: Vector },
) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333";

  ctx.strokeRect(o.position.x, o.position.y, o.size.x, o.size.y);
}

const fpsData = {
  lastFrameTime: performance.now(),
  lastUpdated: performance.now(),
  lastFPS: 0,
};

function drawUI(ctx: CanvasRenderingContext2D, state: State) {
  ctx.fillStyle = "#fff";
  ctx.font = "24px serif";

  const n = state.statsManager.enemiesDied;
  const LEFT_OFFSET = 50;

  ctx.fillText(`${n}`, LEFT_OFFSET, 100);
  ctx.fillText(
    `${state.gameSpeedManager.gameSpeed.toFixed(2)}`,
    LEFT_OFFSET,
    150,
  );

  let fps = fpsData.lastFPS;

  if (performance.now() - fpsData.lastUpdated > 500) {
    fps = 1000 / (performance.now() - fpsData.lastFrameTime);
    fpsData.lastFPS = fps;
    fpsData.lastUpdated = performance.now();
  }

  fpsData.lastFrameTime = performance.now();

  ctx.fillText(`fps: ${fps.toFixed(0)}`, LEFT_OFFSET, 200);
}

export function createCanvasDrawer(ctx: CanvasRenderingContext2D) {
  return {
    draw: (state: State) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw camera frame
      drawRectangle(ctx, {
        position: state.cameraManager.frame.position,
        size: state.cameraManager.frame.size,
      });

      // Draw UI
      drawUI(ctx, state);

      // Make camera frame clipping
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        state.cameraManager.frame.position.x,
        state.cameraManager.frame.position.y,
        state.cameraManager.frame.size.x,
        state.cameraManager.frame.size.y,
      );
      ctx.clip();

      // Draw world pane
      drawRectangle(ctx, {
        position: state.cameraManager.toScreen({ x: 0, y: 0 }),
        size: state.world.size,
      });

      // Draw objects
      drawObjects(ctx, state, state.gameObjectsManager.objects);

      ctx.restore(); // Restore the previous clipping state
    },
  } as const;
}
