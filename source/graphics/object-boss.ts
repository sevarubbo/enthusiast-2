import { drawHealthBar } from "./healthbar";
import { drawObjectShield } from "./helpers";
import { drawCircle } from "services/canvas";
import { vector } from "services/vector";
import type { createBossA } from "models/boss-a";
import type { State } from "services/state";

export const drawObjectBoss = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: ReturnType<typeof createBossA>,
): void => {
  drawCircle(ctx, {
    position: state.cameraManager.toScreen(object),
    radius: object.collision.circleRadius - 10,
    color: object.color,
  });

  drawObjectShield(ctx, state, {
    ...object,
    collision: {
      ...object.collision,
      circleRadius: object.collision.circleRadius - 10,
    },
  });

  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),
      vector.create(0, -object.collision.circleRadius - 10),
    );

    drawHealthBar(
      ctx,
      healthBarPosition,
      object.health.current,
      object.health.max,
    );
  }

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
