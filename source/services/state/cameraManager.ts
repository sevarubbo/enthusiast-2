import { getIsPointerDown, getKeysPressed, getPointerPosition } from "../io";
import { vector } from "../vector";
import type { Updatable } from ".";
import type { Vector } from "../vector";

export interface CameraManager extends Updatable {
  frame: {
    size: Vector;
    position: Vector;
  };
  worldTargetPoint: Vector;
  followPoint: Vector | null;
  worldPointerPosition: Vector;
  isPointerDown: boolean;
  fromScreen(coordinates: Vector): Vector;
  isWithinFrame(screenCoordinates: Vector, margin: number): boolean;
  toScreen(coordinates: Vector): Vector;
}

const SCROLL_SPEED = 6;

export const createCameraManager = (
  o: Partial<Pick<CameraManager, "frame" | "worldTargetPoint">>,
): CameraManager => ({
  followPoint: null,
  frame: o.frame || {
    size: vector.create(0, 0),
    position: vector.create(0, 0),
  },
  worldTargetPoint: o.worldTargetPoint || vector.create(0, 0),
  worldPointerPosition: vector.create(0, 0),
  isPointerDown: false,
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
  isWithinFrame(screenCoordinates, margin) {
    if (screenCoordinates.x < this.frame.position.x - margin) {
      return false;
    }

    if (screenCoordinates.y < this.frame.position.y - margin) {
      return false;
    }

    if (
      screenCoordinates.x >
      this.frame.position.x + this.frame.size.x + margin
    ) {
      return false;
    }

    if (
      screenCoordinates.y >
      this.frame.position.y + this.frame.size.y + margin
    ) {
      return false;
    }

    return true;
  },
  update(delta) {
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

    const { pointerPosition } = getPointerPosition();

    this.worldPointerPosition = this.fromScreen(pointerPosition);

    this.isPointerDown = getIsPointerDown();

    if (this.followPoint) {
      // Move the camera to follow the point with certain easing
      const distance = vector.distance(this.worldTargetPoint, this.followPoint);

      if (distance > 500) {
        this.worldTargetPoint = this.followPoint;
      } else {
        const speed = (delta * distance) / 2000;

        this.worldTargetPoint = vector.lerp(
          this.worldTargetPoint,
          this.followPoint,
          speed,
        );
      }
    }
  },
});
