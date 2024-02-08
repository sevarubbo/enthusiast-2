import { vector } from "../vector";
import type { Vector } from "../vector";
import type { Movable, State } from "./types";

export interface ObjectMovementManager {
  maxSpeed: number;
  speed: number;
  realSpeed: number;
  direction: Vector;
  nextPosition: Vector;
  speedVector: Vector;
  start(direction: Vector): void;
  stop(): void;
  setSpeedVector(v: Vector): void;
  moveToTargetPoint(object: Movable, v: Vector | null | undefined): void;

  update(delta: number, getState: () => State, object: Movable): void;
}

type Props<OB extends object, RP extends keyof OB, OP extends keyof OB> = Pick<
  OB,
  RP
> &
  Partial<Pick<OB, OP>>;

export const createObjectMovementManager = (
  // Also pass object this manager is attached to
  o: Props<ObjectMovementManager, "maxSpeed", "direction" | "speed">,
): ObjectMovementManager =>
  ({
    maxSpeed: o.maxSpeed,
    speed: o.maxSpeed,
    realSpeed: 0,
    direction: o.direction || vector.create(0, 0),
    nextPosition: vector.create(0, 0),
    speedVector: vector.create(0, 0),

    start(direction: Vector) {
      this.speed = o.maxSpeed;
      this.direction = direction;
    },

    stop() {
      this.speed = 0;
    },

    setSpeedVector(speedVector: Vector) {
      this.speedVector = speedVector;
      this.direction = vector.normalize(this.speedVector);
    },

    moveToTargetPoint(object: Movable, targetPoint: Vector | null) {
      if (!targetPoint) {
        return;
      }

      const d = vector.distance(object, targetPoint);

      if (d < this.realSpeed) {
        object.x = targetPoint.x;
        object.y = targetPoint.y;
        object.targetPoint = null;

        this.stop();

        return;
      }

      this.start(vector.direction(object, targetPoint));

      return;
    },

    update(delta, getState, object) {
      this.moveToTargetPoint(object, object.targetPoint);

      this.realSpeed = this.speed * delta;
      this.speedVector = vector.scale(this.direction, this.realSpeed);
      this.nextPosition = vector.add(object, this.speedVector);

      object.x = this.nextPosition.x;
      object.y = this.nextPosition.y;
    },
  }) as const;
