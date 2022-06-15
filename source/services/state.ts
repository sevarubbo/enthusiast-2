import { getKeyPressed } from "./io";

export interface Identifiable {
  id: string;
}

export interface State<OT> {
  gameSpeedManager: GameSpeedManager;
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
