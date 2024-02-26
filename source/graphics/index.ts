import { drawQueue } from "./helpers";
import { drawObjects } from "./objects";
import { drawUI } from "./ui";
import type { Vector } from "../services/vector";
import type { State } from "services/state";

function drawRectangle(
  ctx: CanvasRenderingContext2D,
  o: { position: Vector; size: Vector; dashed?: boolean },
) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333";

  if (!o.dashed) {
    ctx.setLineDash([]);
  } else {
    ctx.setLineDash([5, 15]);
  }

  ctx.strokeRect(o.position.x, o.position.y, o.size.x, o.size.y);

  ctx.setLineDash([]);
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
      drawQueue.schedule(3, () => {
        drawUI(ctx, state);
      });

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

      const drawQuadrant = (q: typeof state.quadtree) => {
        drawRectangle(ctx, {
          dashed: true,
          position: state.cameraManager.toScreen({
            x: q.boundary.x,
            y: q.boundary.y,
          }),
          size: {
            x: q.boundary.width,
            y: q.boundary.height,
          },
        });

        q.quadrants.forEach((qq) => {
          drawQuadrant(qq);
        });
      };

      drawQuadrant(state.quadtree);

      // Draw objects
      drawObjects(ctx, state, state.gameObjectsManager.objects);

      const sortedQueue = drawQueue.queue.sort((a, b) => a.index - b.index);

      while (sortedQueue.length) {
        const q = sortedQueue.shift();

        if (q) {
          q.fn(ctx);
        }
      }

      drawQueue.queue = [];

      ctx.restore(); // Restore the previous clipping state
    },
  } as const;
}
