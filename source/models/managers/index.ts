import { vector } from "services/vector";
import type { Collidable, ObjectManager } from "services/state/types";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export interface ObjectCollisionManager extends ObjectManager {
  collidesWithObjects: Array<StateObject & Collidable>;
  lastObjectPosition: Vector;
  isSolid: boolean;
  box?: Vector;
}

export const createObjectCollisionManager = ({
  isSolid = true,
  box,
}: {
  isSolid?: boolean;
  box?: Vector;
} = {}): ObjectCollisionManager => ({
  lastObjectPosition: vector.zero,
  collidesWithObjects: [],
  isSolid,
  box,
  update() {
    // ...
  },
});
