import { getKeyPressed, getKeysPressed } from "./io";
import { vector } from "./vector";
import type { Vector } from "./vector";

export interface Identifiable {
  id: string;
}

export interface State<OT> {
  gameSpeedManager: GameSpeedManager;
  world: {
    size: Vector;
  };
  cameraManager: CameraManager;
  objects: Record<string, OT>;
}

export interface Updatable {
  update(getState: () => State<object>): void;
}

export interface GameSpeedManager extends Updatable {
  gameSpeed: number;
}

const MAX_GAME_SPEED = 10;
const GAME_SPEED_CHANGE_STEP = 0.1;

export const createGameSpeedManager = (): GameSpeedManager => ({
  gameSpeed: 1,
  update() {
    const currentKeyPressed = getKeyPressed();

    if (currentKeyPressed === "=") {
      this.gameSpeed += GAME_SPEED_CHANGE_STEP;

      if (this.gameSpeed > MAX_GAME_SPEED) {
        this.gameSpeed = MAX_GAME_SPEED;
      }
    } else if (currentKeyPressed === "-") {
      this.gameSpeed -= GAME_SPEED_CHANGE_STEP;

      if (this.gameSpeed < 0) {
        this.gameSpeed = 0;
      }
    }
  },
});

export interface CameraManager extends Updatable {
  position: Vector;
  fromScreen(coordinates: Vector): Vector;
  toScreen(coordinates: Vector): Vector;
}

const SCROLL_SPEED = 2;

export const createCameraManager = (): CameraManager => ({
  position: { x: -100, y: -100 },
  toScreen(coordinates: Vector) {
    return vector.subtract(coordinates, this.position);
  },
  fromScreen(coordinates: Vector) {
    return vector.add(coordinates, this.position);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(getState: () => State<object>) {
    const { keysPressed } = getKeysPressed();

    if (keysPressed.has("ArrowUp")) {
      this.position.y -= SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowDown")) {
      this.position.y += SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowRight")) {
      this.position.x += SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowLeft")) {
      this.position.x -= SCROLL_SPEED;
    }
  },
});
