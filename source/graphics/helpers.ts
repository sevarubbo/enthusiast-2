// With types

import { drawHealthBar } from "./healthbar";
import {
  drawCircle,
  drawCircleOutline,
  drawCircleProgress,
} from "services/canvas";
import { vector } from "services/vector";
import type { State } from "services/state";
import type { createObjectShieldManager } from "services/state/objectShieldManager";
import type { StateObject } from "types";

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
  // Draw text on top in the middle
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(
    icon,
    state.cameraManager.toScreen(object).x,
    state.cameraManager.toScreen(object).y,
  );
};

export const drawDefaultRoundObjectView = (
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject & { collisionCircle: { radius: number } },
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

export const drawObjectShield = (
  ctx: CanvasRenderingContext2D,
  state: State,

  // Object with shield
  object: StateObject & {
    collisionCircle: { radius: number };
    shield: ReturnType<typeof createObjectShieldManager>;
  },
) => {
  if (object.shield.active) {
    drawCircleOutline(ctx, {
      radius: Math.max(object.collisionCircle.radius, 17) + 3,
      position: state.cameraManager.toScreen(object),
      color: "rgba(255, 255, 255, 0.5)",
      lineWidth: 3,
    });

    drawCircleProgress(ctx, {
      radius: Math.max(object.collisionCircle.radius, 17) + 3,
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
  clear: () => {
    drawQueue.queue = [];
  },
  schedule: (index: 1 | 2 | 3, fn: (ctx: CanvasRenderingContext2D) => void) => {
    drawQueue.queue.push({
      index,
      fn,
    });
  },
};
