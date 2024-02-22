import { drawHealthBar } from "./healthbar";
import {
  drawDefaultRoundObjectView,
  drawObjectAsText,
  drawObjectShield,
  drawQueue,
  getPlantColor,
} from "./helpers";
import { drawObjectBoss } from "./object-boss";
import { drawCircle, drawCircleOutline, drawRectangle } from "services/canvas";
import { vector } from "services/vector";
import type { State, Weapon } from "services/state";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

const drawObjectWeapon = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject & { weapon: Weapon },
) => {
  if (!("collisionCircle" in object)) {
    throw new Error("Object must have collisionCircle");
  }

  if (object.weapon.type === "machine_gun_b") {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(
      "🗡️",
      state.cameraManager.toScreen(object).x -
        object.collisionCircle.radius -
        18,
      state.cameraManager.toScreen(object).y + 7,
    );
  }

  // Draw ammo
  if (
    object.weapon.ammo < object.weapon.maxAmmo ||
    object.weapon.type === "machine_gun_b"
  ) {
    let points = Math.floor((object.weapon.ammo / object.weapon.maxAmmo) * 5);
    let color =
      points <= 1 ? "rgba(255, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";

    if (points === 0) {
      points = 1;

      if (object.weapon.ammo === 0) color = "rgba(255, 0, 0, 0.2)";
    }

    for (let i = 0; i < points; i++) {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen(
          vector.add(object, vector.create(-10 + i * 5, 26)),
        ),
        color,
        radius: 2,
      });
    }
  }
};

function drawObjectAsCircle(
  ctx: CanvasRenderingContext2D,
  state: State,
  object:
    | { radius: number; x: number; y: number; color: string }
    | (StateObject & { collisionCircle: { radius: number } }),
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

  if ("weapon" in object) {
    drawQueue.schedule(2, (ctx2) => {
      drawObjectWeapon(ctx2, state, object);
    });
  }

  if ("shootingRange" in object) {
    drawCircleOutline(ctx, {
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.1)",
      radius: object.shootingRange,
      lineWidth: 1,
    });
  }

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

    case "weapon_a_item": {
      drawObjectAsText(ctx, state, object, "🗡️");

      return;
    }

    case "item_reward_a": {
      drawObjectAsText(ctx, state, object, object.icon);

      return;
    }

    case "boss_a": {
      drawObjectBoss(ctx, state, object);

      return;
    }

    case "healing_station_a": {
      drawCircleOutline(ctx, {
        position: state.cameraManager.toScreen(object),
        color: object.color,
        radius: object.collisionCircle.radius,
        lineWidth: 5,
      });

      return;
    }

    case "wall_a": {
      const box = object.collision.box as Vector;

      drawRectangle(ctx, {
        position: state.cameraManager.toScreen(object),
        width: box.x,
        height: box.y,
        color: object.color,
      });

      return;
    }

    default: {
      drawQueue.schedule(2, (ctx2) => {
        if ("collisionCircle" in object) {
          drawDefaultRoundObjectView(ctx2, state, object);
        } else {
          throw new Error("Object must have collisionCircle");
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
