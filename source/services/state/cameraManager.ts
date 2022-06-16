import { getKeysPressed } from "../io";
import { vector } from "../vector";
import type { Updatable } from ".";
import type { Vector } from "../vector";

export interface CameraManager extends Updatable {
  frame: {
    size: Vector;
    position: Vector;
  };
  worldTargetPoint: Vector;
  fromScreen(coordinates: Vector): Vector;
  isWithinFrame(screenCoordinates: Vector): boolean;
  toScreen(coordinates: Vector): Vector;
}

const SCROLL_SPEED = 2;

export const createCameraManager = (o: Partial<Pick<CameraManager, "frame" | "worldTargetPoint">>): CameraManager => ({
  frame: o.frame || {
    size: vector.create(0, 0),
    position: vector.create(0, 0),
  },
  worldTargetPoint: o.worldTargetPoint || vector.create(0, 0),
  toScreen(coordinates) {
    return vector.add(
      vector.subtract(coordinates, this.worldTargetPoint),
      vector.scale(this.frame.size, 1 / 2),
      this.frame.position,
    );
  },
  fromScreen(coordinates) {
    return vector.subtract(
      vector.subtract(
        vector.add(coordinates, this.worldTargetPoint),
        vector.scale(this.frame.size, 1 / 2),
      ),
      this.frame.position,
    );
  },
  isWithinFrame(screenCoordinates) {
    if (screenCoordinates.x < this.frame.position.x) {
      return false;
    }

    if (screenCoordinates.y < this.frame.position.y) {
      return false;
    }

    if (screenCoordinates.x > this.frame.position.x + this.frame.size.x) {
      return false;
    }

    if (screenCoordinates.y > this.frame.position.y + this.frame.size.y) {
      return false;
    }

    return true;
  },
  update() {
    const { keysPressed } = getKeysPressed();

    if (keysPressed.has("ArrowUp")) {
      this.worldTargetPoint.y -= SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowDown")) {
      this.worldTargetPoint.y += SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowRight")) {
      this.worldTargetPoint.x += SCROLL_SPEED;
    }

    if (keysPressed.has("ArrowLeft")) {
      this.worldTargetPoint.x -= SCROLL_SPEED;
    }
  },
});
