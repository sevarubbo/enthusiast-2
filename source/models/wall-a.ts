import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { vector } from "../services/vector";
import type { Vector } from "../services/vector";

export const createWallA = (
  position: Vector,
  size: Vector = vector.create(50, 50),
) => {
  return {
    ...createBaseObject(position),
    type: "wall_a",
    color: "#fff",

    collision: createObjectCollisionManager({
      boxSize: size,
    }),

    update() {
      if (this.collision.collidesWithObjects.length > 0) {
        // console.log(this.collision.collidesWithObjects);
      }
    },
  } as const;
};
