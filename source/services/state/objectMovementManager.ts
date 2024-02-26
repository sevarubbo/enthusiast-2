import { vector } from "../vector";
import type { StateObject } from "../../types";
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
  angle: number;

  targetPoint: Vector | null;
  setTargetPoint(targetPoint: Vector | null): void;
  moveToTargetPoint(object: Movable, v: Vector | null | undefined): void;

  update(delta: number, state: State, object: StateObject & Movable): void;
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
    angle: Math.random() * 2 * Math.PI,
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

    targetPoint: null,

    setTargetPoint(targetPoint: Vector | null) {
      this.targetPoint = targetPoint && {
        x: targetPoint.x,
        y: targetPoint.y,
      };

      if (targetPoint === null) {
        this.stop();
      }
    },

    moveToTargetPoint(object: Movable, targetPoint?: Vector | null) {
      const tp = targetPoint || this.targetPoint;

      if (!tp) {
        return;
      }

      const d = vector.distance(object, tp);

      if (d < this.realSpeed) {
        object.x = tp.x;
        object.y = tp.y;
        object.targetPoint = null;
        this.setTargetPoint(null);

        this.stop();

        return;
      }

      this.start(vector.direction(object, tp));

      return;
    },

    update(delta, state, object) {
      this.moveToTargetPoint(object, object.targetPoint);

      this.realSpeed = this.speed * delta;
      this.speedVector = vector.scale(this.direction, this.realSpeed);
      this.nextPosition = vector.add(object, this.speedVector);

      if ("setPosition" in object) {
        object.setPosition(this.nextPosition);
      } else {
        object.x = this.nextPosition.x;
        object.y = this.nextPosition.y;
      }

      this.angle = vector.toAngle(this.direction);
    },
  }) as const;
