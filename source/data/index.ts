import { createCircle, createTriangle } from "models";
import { createCameraManager, createGameSpeedManager } from "services/state";
import type { GameState } from "types";

const circle = createCircle();
const triangle = createTriangle();
const triangle2 = createTriangle();

export function createDefaultState(): GameState {
  return {
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager(),
    world: {
      size: { x: 1000, y: 500 },
    },
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
      [triangle2.id]: triangle2,
    },
  };
}
