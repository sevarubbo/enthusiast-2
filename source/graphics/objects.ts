import { drawHealthBar } from "./healthbar";
import { getPlantColor } from "./helpers";
import {
  drawCircle,
  drawCircleOutline,
  drawCircleProgress,
} from "services/canvas";
import { vector } from "services/vector";
import type { createObjectShieldManager } from "../services/state/objectShieldManager";
import type { State } from "services/state";
import type { StateObject } from "types";

const drawObjectShield = (
  ctx: CanvasRenderingContext2D,
  state: State,

  // Object with shield
  object: StateObject & {
    shield: ReturnType<typeof createObjectShieldManager>;
  },
) => {
  if (object.shield.active) {
    drawCircleOutline(ctx, {
      radius: 20,
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.5)",
      lineWidth: 3,
    });

    drawCircleProgress(ctx, {
      radius: 20,
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.5)",
      lineWidth: 3,
      progress: object.shield.hp / object.shield.maxHp,
    });
  }
};

const drawDefaultObjectView = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject,
) => {
  drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius: object.collisionCircle.radius,
    color: "color" in object ? object.color : "#fff",
  });

  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),
      vector.create(0, -object.collisionCircle.radius - 10),
    );

    drawHealthBar(
      ctx,
      healthBarPosition,
      object.health.current,
      object.health.max,
    );
  }

  if ("shootingAngle" in object) {
    const directionPointPosition = vector.scale(
      vector.fromAngle(object.shootingAngle),
      10,
    );

    drawCircle(ctx, {
      position: state.cameraManager.toScreen(
        vector.add(object, directionPointPosition),
      ),
      color: "#fff",
      radius: 4,
    });
  }

  if ("movement" in object) {
    const directionPointPosition = vector.scale(
      vector.fromAngle(object.movement.angle),
      Math.min(object.collisionCircle.radius * 0.9, 20),
    );

    drawCircle(ctx, {
      position: state.cameraManager.toScreen(
        vector.add(object, directionPointPosition),
      ),
      color: "#fff",
      radius: Math.min(object.collisionCircle.radius / 3, 4),
    });
  }

  if ("shield" in object) {
    drawObjectShield(ctx, state, object);
  }
};

export const drawQueue = {
  queue: [] as Array<{
    index: 1 | 2;
    fn: (ctx: CanvasRenderingContext2D) => void;
  }>,
  clear: () => {
    drawQueue.queue = [];
  },
  schedule: (index: 1 | 2, fn: (ctx: CanvasRenderingContext2D) => void) => {
    drawQueue.queue.push({
      index,
      fn,
    });
  },
};

function drawObjectAsCircle(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: { radius: number; x: number; y: number; color: string } | StateObject,
) {
  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),

      (() => {
        if ("radius" in object) {
          return vector.create(0, -object.radius - 10);
        }

        return vector.create(0, -15);
      })(),
    );

    drawQueue.schedule(1, (ctx2) => {
      drawHealthBar(
        ctx2,
        healthBarPosition,
        object.health.current,
        object.health.max,
      );
    });
  }

  return drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius: "radius" in object ? object.radius : object.collisionCircle.radius,
    color: "color" in object ? object.color : "#fff",
  });
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject,
) {
  // // Draw next point
  // if ("targetPoint" in object && object.targetPoint) {
  //   drawCircle(ctx, {
  //     position: state.cameraManager.toScreen(object.targetPoint),
  //     color: "#aaa",
  //     radius: 2,
  //   });
  // }

  // // Draw object id
  // ctx.font = "12px Arial";
  // ctx.fillStyle = "#fff";
  // ctx.textAlign = "center";
  // ctx.fillText(
  //   object.id,
  //   state.cameraManager.toScreen(object).x,
  //   state.cameraManager.toScreen(object).y - 50,
  // );

  switch (object.type) {
    case "enemy": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "tower": {
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

      return;
    }

    case "bullet": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "house": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "enemyC": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "stranger_a": {
      drawQueue.schedule(2, () => {
        drawObjectShield(ctx, state, object);

        drawObjectAsCircle(ctx, state, {
          radius: 10,
          x: object.x,
          y: object.y,
          color: "#a31c54",
        });

        const directionPointPosition = vector.scale(
          vector.fromAngle(object.shootingAngle),
          10,
        );

        drawCircle(ctx, {
          position: state.cameraManager.toScreen(
            vector.add(object, directionPointPosition),
          ),
          color: "#fff",
          radius: 4,
        });
      });

      if (object.health.current < object.health.max) {
        const healthBarPosition = vector.add(
          state.cameraManager.toScreen(object),
          vector.create(0, -object.collisionCircle.radius - 10),
        );

        drawQueue.schedule(1, (ctx2) => {
          drawHealthBar(
            ctx2,
            healthBarPosition,
            object.health.current,
            object.health.max,
          );
        });
      }

      return;
    }

    case "plant_a": {
      drawObjectAsCircle(ctx, state, {
        radius: object.collisionCircle.radius,
        x: object.x,
        y: object.y,
        color: getPlantColor(object.health.current, object.health.max),
      });

      return;
    }

    case "plant_eater_a": {
      drawObjectAsCircle(ctx, state, {
        ...object,
      });

      const directionPointPosition = vector.scale(
        vector.fromAngle(object.movement.angle),
        object.collisionCircle.radius / 1.5,
      );

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(
          vector.add(object, directionPointPosition),
        ),
        color: "#000",
        radius: object.collisionCircle.radius / 2,
      });

      drawObjectShield(ctx, state, object);

      return;
    }

    case "shield_item": {
      // Draw text on top in the middle
      ctx.font = "18px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(
        "🛡",
        state.cameraManager.toScreen(object).x,
        state.cameraManager.toScreen(object).y,
      );

      return;
    }

    default: {
      drawDefaultObjectView(ctx, state, object);
    }
  }
}

export function drawObjects(
  ctx: CanvasRenderingContext2D,
  state: State,
  objects: State["gameObjectsManager"]["objects"],
) {
  for (const objectId in objects) {
    const object = objects[objectId];

    if (
      object &&
      state.cameraManager.isWithinFrame(state.cameraManager.toScreen(object))
    ) {
      drawObject(ctx, state, object);
    }
  }
}
