import { vector } from "services/vector";
import type { Vector } from "services/vector";
import type { CollidableObject } from "types";

type TT = { boxSize: Vector } | { circleRadius: number };

export interface ObjectCollisionManager {
  collidesWithObjects: Array<CollidableObject>;
  lastObjectPosition: Vector;
  isSolid: boolean;
  isFixed: boolean;
  getRec(position: Vector): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const createObjectCollisionManager = <T extends TT>(
  o: T & {
    isSolid?: boolean;
    isFixed?: boolean;
  },
): ObjectCollisionManager & T => {
  return {
    lastObjectPosition: vector.zero,
    collidesWithObjects: [] as ObjectCollisionManager["collidesWithObjects"],
    isSolid: o.isSolid !== false,
    isFixed: o.isFixed === true,

    ...(("boxSize" in o
      ? { boxSize: o.boxSize }
      : { circleRadius: o.circleRadius }) as T),

    getRec(position: Vector) {
      return "boxSize" in this
        ? {
            x: position.x,
            y: position.y,
            width: this.boxSize.x,
            height: this.boxSize.y,
          }
        : {
            x: position.x - this.circleRadius,
            y: position.y - this.circleRadius,
            width: this.circleRadius * 2,
            height: this.circleRadius * 2,
          };
    },
  } as ObjectCollisionManager & T;
};
