import { createCircle, createTriangle } from "../models";
import { createGameSpeedManager } from "services/state";
import type { GameState } from "types";

const circle = createCircle();
const triangle = createTriangle();
const triangle2 = createTriangle();

export function createDefaultState(): GameState {
  return {
    gameSpeedManager: createGameSpeedManager(),
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
      [triangle2.id]: triangle2,
    },
  };
}
