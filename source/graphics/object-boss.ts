import { drawDefaultRoundObjectView } from "./helpers";
import { drawCircle } from "services/canvas";
import type { createBossA } from "models/boss-a";
import type { State } from "services/state";

export const drawObjectBoss = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: ReturnType<typeof createBossA>,
): void => {
  drawDefaultRoundObjectView(ctx, state, object);

  const bullet = object.collision.collidesWithObjects.find(
    (o) => o.type === "bullet" && o.belongsTo !== object.id,
  );

  if (bullet) {
    drawCircle(ctx, {
      position: state.cameraManager.toScreen(object),
      radius: object.collision.circleRadius,
      color: `rgba(255, 255, 255, ${1 - object.health.current / object.health.max})`,
    });
  }
};
