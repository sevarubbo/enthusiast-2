import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { vector } from "../services/vector";
import type { Vector } from "../services/vector";

export const createWallA = (position: Vector) => {
  return {
    type: "wall_a",
    ...createBaseObject(position),
    color: "#444",

    collision: createObjectCollisionManager({
      box: vector.create(100, 10),
    }),
  } as const;
};
