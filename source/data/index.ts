import { createCircle, createTriangle } from "../models";
import { getKeyPressed } from "../services/io";
import type { Circle, Triangle } from "../models";
import type { GameSpeedManager, State } from "../services/state";

const circle = createCircle();
const triangle = createTriangle();
const triangle2 = createTriangle();

const gameSpeedManager: GameSpeedManager = {
  gameSpeed: 1,
  update() {
    const currentKeyPressed = getKeyPressed();

    if (currentKeyPressed === "0") {
      this.gameSpeed = 0;
    } else if (currentKeyPressed === "1") {
      this.gameSpeed = 1;
    } else if (currentKeyPressed === "2") {
      this.gameSpeed = 2;
    }
  },
};

export type StateObject = (
  | Circle
  | Triangle
);

export function createDefaultState(): State<StateObject> {
  return {
    gameSpeedManager,
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
      [triangle2.id]: triangle2,
    },
  };
}
