import { createCircle, createTriangle } from "models";
import { createCameraManager } from "services/cameraManager";
import { createGameSpeedManager } from "services/gameSpeedManager";
import { vector } from "services/vector";
import type { GameState } from "types";

const circle = createCircle();
const triangle = createTriangle();
const triangle2 = createTriangle();
const triangle3 = createTriangle();

export function createDefaultState(): GameState {
  return {
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 200),
        size: vector.create(500, 500),
      },
      worldTargetPoint: vector.create(350, 350),
    }),
    world: {
      size: { x: 700, y: 700 },
    },
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
      [triangle2.id]: triangle2,
      [triangle3.id]: triangle3,
    },
  };
}
