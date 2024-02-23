import { vector } from "services/vector";
import type { Collidable } from "services/state/types";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export type ObjectCollisionManager = (
  | { boxSize: Vector }
  | { circleRadius: number }
) & {
  collidesWithObjects: Array<StateObject & Collidable>;
  lastObjectPosition: Vector;
  isSolid: boolean;
  getRec(position: Vector): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const createObjectCollisionManager = (
  o: {
    isSolid?: boolean;
  } & ({ boxSize: Vector } | { circleRadius: number }),
): ObjectCollisionManager => {
  return {
    lastObjectPosition: vector.zero,
    collidesWithObjects: [],
    isSolid: o.isSolid !== false,

    ...("boxSize" in o
      ? { boxSize: o.boxSize }
      : { circleRadius: o.circleRadius }),

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
  };
};
