import { drawQueue } from "./helpers";
import type { State } from "services/state";

const fpsData = {
  lastFrameTime: performance.now(),
  lastUpdated: performance.now(),
  lastFPS: 0,
};

export function drawUI(ctx: CanvasRenderingContext2D, state: State) {
  const LEFT_OFFSET = 50;

  ctx.fillStyle = "#fff";
  ctx.font = "24px serif";
  ctx.textAlign = "left";

  ctx.fillText(`SCORE: ${state.statsManager.score}`, LEFT_OFFSET, 100);
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

  // Plants
  const plants = state.gameObjectsManager.findObjectsByType("plant_a");

  ctx.fillText(`pl: ${plants.length}`, LEFT_OFFSET, 420);

  // If stranger died, show the message
  if (state.statsManager.strangerDied) {
    drawQueue.schedule(3, (_ctx) => {
      _ctx.font = "24px serif";
      // Center to camera frame
      _ctx.textAlign = "center";
      _ctx.fillStyle = "#f00";
      _ctx.fillText(
        "STRANGER DIED",
        state.cameraManager.frame.position.x +
          state.cameraManager.frame.size.x / 2,
        state.cameraManager.frame.position.y +
          state.cameraManager.frame.size.y / 2 +
          60,
      );
    });
  }

  // If all enemies are dead, show the message
  if (state.statsManager.bossDied) {
    drawQueue.schedule(3, (_ctx) => {
      _ctx.font = "24px serif";
      // Center to camera frame
      _ctx.textAlign = "center";
      _ctx.fillStyle = "#f00";
      _ctx.fillText(
        "MISSION COMPLETE",
        state.cameraManager.frame.position.x +
          state.cameraManager.frame.size.x / 2,
        state.cameraManager.frame.position.y +
          state.cameraManager.frame.size.y / 2 +
          -60,
      );
    });
  }
}
