import { drawHealthBar } from "./healthbar";
import {
  drawDefaultRoundObjectView,
  drawObjectAsText,
  drawObjectShield,
  drawObjectWeapon,
  drawQueue,
  getPlantColor,
} from "./helpers";
import { drawObjectBoss } from "./object-boss";
import { drawObjectTower } from "./object-tower";
import { drawCircle, drawCircleOutline, drawRectangle } from "services/canvas";
import { vector } from "services/vector";
import type { State } from "services/state";
import type { StateObject } from "types";

function drawObjectAsCircle(
  ctx: CanvasRenderingContext2D,
  state: State,
  object:
    | { radius: number; x: number; y: number; color: string }
    | (StateObject & {
        collision: {
          circleRadius: number;
        };
      }),
  options: {
    showHealthBar?: boolean;
  } = {
    showHealthBar: true,
  },
) {
  if (
    options.showHealthBar &&
    "health" in object &&
    object.health.current < object.health.max
  ) {
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

  const radius = (() => {
    if ("radius" in object) {
      return object.radius;
    }

    return object.collision.circleRadius;
  })();

  return drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius,
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

  if ("weapon" in object) {
    drawQueue.schedule(2, (ctx2) => {
      drawObjectWeapon(ctx2, state, object);
    });
  }

  if ("shootingRange" in object) {
    drawCircleOutline(ctx, {
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.02)",
      radius: object.shootingRange,
      lineWidth: 1,
    });
  }

  switch (object.type) {
    case "enemy": {
      drawObjectAsCircle(ctx, state, object, {
        showHealthBar: false,
      });

      return;
    }

    case "tower": {
      drawQueue.schedule(1, () => {
        drawObjectTower(ctx, state, object);
      });

      return;
    }

    case "bullet": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "house": {
      drawQueue.schedule(1, () => {
        drawObjectAsCircle(ctx, state, object);
      });

      return;
    }

    case "enemyC": {
      drawObjectAsCircle(ctx, state, object, {
        showHealthBar: false,
      });

      return;
    }

    case "stranger_a": {
      drawQueue.schedule(3, () => {
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
          vector.create(0, -object.collision.circleRadius - 10),
        );

        drawQueue.schedule(3, (ctx2) => {
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
        radius: object.collision.circleRadius,
        x: object.x,
        y: object.y,
        color: getPlantColor(object.health.current, object.health.max),
      });

      return;
    }

    case "plant_eater_a": {
      drawQueue.schedule(1, () => {
        drawObjectAsCircle(ctx, state, {
          ...object,
        });

        const directionPointPosition = vector.scale(
          vector.fromAngle(object.movement.angle),
          object.collision.circleRadius / 1.5,
        );

        drawCircle(ctx, {
          position: state.cameraManager.toScreen(
            vector.add(object, directionPointPosition),
          ),
          color: "#000",
          radius: object.collision.circleRadius / 2,
        });

        drawObjectShield(ctx, state, object);
      });

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

    case "weapon_a_item": {
      drawObjectAsText(ctx, state, object, "🗡️");

      return;
    }

    case "item_reward_a": {
      drawObjectAsText(ctx, state, object, object.icon);

      return;
    }

    case "item_shotgun": {
      drawQueue.schedule(1, () => {
        drawObjectAsText(ctx, state, object, object.icon);
      });

      return;
    }

    case "boss_a": {
      drawQueue.schedule(2, () => {
        drawObjectBoss(ctx, state, object);
      });

      return;
    }

    case "healing_station_a": {
      ctx.shadowColor = object.color;
      ctx.shadowBlur = 10;

      drawCircleOutline(ctx, {
        position: state.cameraManager.toScreen(object),
        color: object.color,
        radius: object.collision.circleRadius,
        lineWidth: 1,
      });

      ctx.shadowBlur = 0;

      return;
    }

    case "blood_particle": {
      const opacity = object.timeLeftToLive / object.timeToLive;

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(object),
        radius: 2,
        color: `rgba(255, 150, 0, ${opacity})`,
      });

      return;
    }

    case "blood_stain": {
      const MIN_RADIUS = 5;
      const MAX_RADIUS = 15;

      // Increase radius based in leftTimeToLive (when 0 it will be MAX_RADIUS)
      const radius =
        MIN_RADIUS +
        (MAX_RADIUS - MIN_RADIUS) *
          ((object.timeToLive - object.timeLeftToLive) / object.timeToLive);

      const opacity = object.timeLeftToLive / object.timeToLive;

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(object),
        radius,
        color: `rgba(255, 150, 0, ${opacity})`,
      });

      return;
    }

    case "wall_a": {
      if (!("boxSize" in object.collision)) {
        throw new Error("Object must have boxSize");
      }

      const box = object.collision.boxSize;

      drawRectangle(ctx, {
        position: state.cameraManager.toScreen(object),
        width: box.x,
        height: box.y,
        color: object.color,
      });

      return;
    }

    case "slashing_element": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "plant_b_seed": {
      drawQueue.schedule(3, () => {
        drawObjectAsCircle(ctx, state, object);
      });

      return;
    }

    default: {
      const zIndex = "collision" in object && object.collision.isSolid ? 3 : 2;

      drawQueue.schedule(zIndex, (ctx2) => {
        if ("collision" in object) {
          drawDefaultRoundObjectView(ctx2, state, object);
        } else {
          throw new Error("Object must have collision circle");
        }
      });
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
      state.cameraManager.isWithinFrame(
        state.cameraManager.toScreen(object),
        50,
      )
    ) {
      drawObject(ctx, state, object);
    }
  }
}
