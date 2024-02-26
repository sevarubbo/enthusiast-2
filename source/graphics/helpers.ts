// With types

import { drawHealthBar } from "./healthbar";
import {
  drawCircle,
  drawCircleOutline,
  drawCircleProgress,
} from "services/canvas";
import { vector } from "services/vector";
import type { State, Weapon } from "services/state";
import type { createObjectShieldManager } from "services/state/objectShieldManager";
import type { CollidableObject, StateObject } from "types";

export const createGradientArray = (
  colorA: string,
  colorB: string,
  steps: number,
): string[] => {
  const colors = [];
  const colorStep = 1 / steps;

  for (let i = 0; i < steps; i++) {
    const color = `rgba(
      ${Math.round(
        (1 - colorStep * i) * parseInt(colorA.slice(1, 3), 16) +
          colorStep * i * parseInt(colorB.slice(1, 3), 16),
      )},
      ${Math.round(
        (1 - colorStep * i) * parseInt(colorA.slice(3, 5), 16) +
          colorStep * i * parseInt(colorB.slice(3, 5), 16),
      )},
      ${Math.round(
        (1 - colorStep * i) * parseInt(colorA.slice(5, 7), 16) +
          colorStep * i * parseInt(colorB.slice(5, 7), 16),
      )},
      1
    )`;

    colors.push(color);
  }

  return colors;
};

const plantColors = [
  ...createGradientArray("#692424", "#ffd511", 10),
  ...createGradientArray("#ffd511", "#57dc10", 10),
];

export const getPlantColor = (health: number, maxHealth: number): string => {
  const colorIndex = Math.round(
    (health / maxHealth) * (plantColors.length - 1),
  );

  return plantColors[colorIndex] as string;
};

export const drawObjectAsText = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject,
  icon: string,
) => {
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 20;

  // Draw text on top in the middle
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(
    icon,
    state.cameraManager.toScreen(object).x,
    state.cameraManager.toScreen(object).y,
  );

  ctx.shadowBlur = 0;
};

export const drawDefaultRoundObjectView = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject &
    (
      | { collisionCircle: { radius: number } }
      | { collision: { circleRadius: number } }
    ),
) => {
  const collisionCircleRadius =
    "collisionCircle" in object
      ? object.collisionCircle.radius
      : object.collision.circleRadius;

  drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius: collisionCircleRadius,
    color: "color" in object ? object.color : "#fff",
  });

  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),
      vector.create(0, -collisionCircleRadius - 10),
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
      Math.min(collisionCircleRadius * 0.9, 20),
    );

    drawCircle(ctx, {
      position: state.cameraManager.toScreen(
        vector.add(object, directionPointPosition),
      ),
      color: "#fff",
      radius: Math.min(collisionCircleRadius / 3, 4),
    });
  }

  if ("shield" in object) {
    drawObjectShield(ctx, state, object);
  }
};

export const drawObjectShield = (
  ctx: CanvasRenderingContext2D,
  state: State,

  // Object with shield
  object: StateObject & {
    shield: ReturnType<typeof createObjectShieldManager>;
  } & (
      | { collisionCircle: { radius: number } }
      | { collision: { circleRadius: number } }
    ),
) => {
  const collisionCircleRadius =
    "collisionCircle" in object
      ? object.collisionCircle.radius
      : object.collision.circleRadius;

  if (object.shield.active) {
    drawCircleOutline(ctx, {
      radius: Math.max(collisionCircleRadius, 17) + 3,
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.5)",
      lineWidth: 3,
    });

    drawCircleProgress(ctx, {
      radius: Math.max(collisionCircleRadius, 17) + 3,
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.5)",
      lineWidth: 3,
      progress: object.shield.hp / object.shield.maxHp,
    });
  }
};

export const drawQueue = {
  queue: [] as Array<{
    index: 1 | 2 | 3;
    fn: (ctx: CanvasRenderingContext2D) => void;
  }>,
  schedule: (index: 1 | 2 | 3, fn: (ctx: CanvasRenderingContext2D) => void) => {
    drawQueue.queue.push({
      index,
      fn,
    });
  },
};

export const drawObjectWeapon = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: CollidableObject & { weapon: Weapon },
) => {
  if (!("collisionCircle" in object) && !("circleRadius" in object.collision)) {
    throw new Error("Object must have collisionCircle");
  }

  let collisionCircleRadius =
    "collisionCircle" in object ? object.collisionCircle.radius : null;

  if (collisionCircleRadius === null && "circleRadius" in object.collision) {
    collisionCircleRadius = object.collision.circleRadius;
  }

  if (!collisionCircleRadius) {
    throw new Error("Object must have collisionCircle");
  }

  if (
    object.weapon.type === "machine_gun_b" ||
    object.weapon.type === "shotgun"
  ) {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(
      object.weapon.type === "machine_gun_b" ? "🗡️" : "🔪",
      state.cameraManager.toScreen(object).x - collisionCircleRadius - 18,
      state.cameraManager.toScreen(object).y + 7,
    );
  }

  // Draw ammo
  if (
    object.weapon.ammo < object.weapon.maxAmmo ||
    object.weapon.type === "machine_gun_b" ||
    object.weapon.type === "shotgun"
  ) {
    const maxPoints = Math.min(5, object.weapon.maxAmmo);
    let points = Math.floor(
      (object.weapon.ammo / object.weapon.maxAmmo) * maxPoints,
    );
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
