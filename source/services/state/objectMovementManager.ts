import { vector } from "../vector";
import type { Vector } from "../vector";
import type { State } from "./types";

export interface ObjectMovementManager {
  maxSpeed: number;
  speed: number;
  realSpeed: number;
  direction: Vector;
  nextPosition: Vector;
  start(direction: Vector): void;
  stop(): void;

  update(delta: number, getState: () => State, object: Vector): void;
}

export const createObjectMovementManager = (maxSpeed: number): ObjectMovementManager => ({
  maxSpeed,
  speed: maxSpeed,
  realSpeed: 0,
  direction: vector.create(0, 0),
  nextPosition: vector.create(0, 0),

  start(direction: Vector) {
    this.direction = direction;
  },

  stop() {
    this.speed = 0;
  },

  update(delta, getState, object) {
    if (!this.speed) {
      return;
    }

    this.realSpeed = this.speed * delta;

    const speedVector = vector.scale(this.direction, this.realSpeed);

    this.nextPosition = vector.add(object, speedVector);

    object.x = this.nextPosition.x;
    object.y = this.nextPosition.y;
  },
});
