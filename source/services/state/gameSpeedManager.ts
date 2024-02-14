import { getKeysPressed } from "../io";
import type { Updatable } from ".";

export interface GameSpeedManager extends Updatable {
  gameSpeed: number;
}

const DEFAULT_GAME_SPEED = 1.2;
const MAX_GAME_SPEED = 10;
const GAME_SPEED_CHANGE_STEP = 0.05;

export const createGameSpeedManager = (): GameSpeedManager => ({
  gameSpeed: DEFAULT_GAME_SPEED,
  update() {
    const { keysPressed } = getKeysPressed();

    if (keysPressed.has("=")) {
      this.gameSpeed += GAME_SPEED_CHANGE_STEP;

      if (this.gameSpeed > MAX_GAME_SPEED) {
        this.gameSpeed = MAX_GAME_SPEED;
      }
    } else if (keysPressed.has("-")) {
      this.gameSpeed -= GAME_SPEED_CHANGE_STEP;

      if (this.gameSpeed < 0) {
        this.gameSpeed = 0;
      }
    } else if (keysPressed.has("0")) {
      this.gameSpeed = DEFAULT_GAME_SPEED;
    }
  },
});
