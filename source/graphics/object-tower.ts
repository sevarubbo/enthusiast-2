import { drawHealthBar } from "./healthbar";
import { drawCircle } from "services/canvas";
import { vector } from "services/vector";
import type { createTower } from "models";
import type { State } from "services/state";

export const drawObjectTower = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: ReturnType<typeof createTower>,
) => {
  drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    ...object,
  });

  const directionPointPosition = vector.scale(
    vector.fromAngle(object.angle),
    10,
  );

  drawCircle(ctx, {
    position: state.cameraManager.toScreen(
      vector.add(object, directionPointPosition),
    ),
    color: "#fff",
    radius: 5,
  });

  if (object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),
      vector.create(0, -object.radius - 10),
    );

    drawHealthBar(
      ctx,
      healthBarPosition,
      object.health.current,
      object.health.max,
    );
  }
};
