import { drawQueue } from "./helpers";
import { drawObjects } from "./objects";
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

const fpsData = {
  lastFrameTime: performance.now(),
  lastUpdated: performance.now(),
  lastFPS: 0,
};

function drawUI(ctx: CanvasRenderingContext2D, state: State) {
  ctx.fillStyle = "#fff";
  ctx.font = "24px serif";

  const n = state.statsManager.money;
  const LEFT_OFFSET = 50;

  ctx.fillText(`SCORE: ${n}`, LEFT_OFFSET, 100);
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
  ctx.fillText(
    `oo: ${Object.keys(state.gameObjectsManager.objects).length}`,
    LEFT_OFFSET,
    300,
  );

  // Render number of towers
  const towers = state.gameObjectsManager.findObjectsByType("tower");

  ctx.fillText(`tt: ${towers.length}`, LEFT_OFFSET, 340);

  // Render number of plant eaters
  const plantEaters =
    state.gameObjectsManager.findObjectsByType("plant_eater_a");

  ctx.fillText(`pe: ${plantEaters.length}`, LEFT_OFFSET, 380);

  // If stranger died, show the message
  if (state.statsManager.strangerDied) {
    drawQueue.schedule(2, (_ctx) => {
      _ctx.font = "24px serif";
      // Center to camera frame
      _ctx.textAlign = "center";
      _ctx.fillStyle = "#f00";
      _ctx.fillText(
        "STRANGER DIED",
        state.cameraManager.frame.position.x +
          state.cameraManager.frame.size.x / 2,
        state.cameraManager.frame.position.y +
          state.cameraManager.frame.size.y / 2,
      );
    });
  }

  // If all enemies are dead, show the message
  if (state.statsManager.bossDied) {
    drawQueue.schedule(2, (_ctx) => {
      _ctx.font = "24px serif";
      // Center to camera frame
      _ctx.textAlign = "center";
      _ctx.fillStyle = "#f00";
      _ctx.fillText(
        "MISSION COMPLETE",
        state.cameraManager.frame.position.x +
          state.cameraManager.frame.size.x / 2,
        state.cameraManager.frame.position.y +
          state.cameraManager.frame.size.y / 2,
      );
    });
  }
}

export function createCanvasDrawer(ctx: CanvasRenderingContext2D) {
  return {
    draw: (state: State) => {
      drawQueue.queue = [];

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

      // Draw queue
      drawQueue.queue
        .sort((a, b) => a.index - b.index)
        .forEach((q) => {
          q.fn(ctx);
        });

      ctx.restore(); // Restore the previous clipping state
    },
  } as const;
}
