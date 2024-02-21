// With types

import type { State } from "services/state";
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
