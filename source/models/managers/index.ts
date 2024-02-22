import { vector } from "services/vector";
import type { Collidable, ObjectManager } from "services/state/types";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export interface ObjectCollisionManager extends ObjectManager {
  collidesWithObjects: Array<StateObject & Collidable>;
  lastObjectPosition: Vector;
  isSolid: boolean;
}

export const createObjectCollisionManager = ({
  isSolid = true,
}: {
  isSolid?: boolean;
} = {}): ObjectCollisionManager => ({
  lastObjectPosition: vector.zero,
  collidesWithObjects: [],
  isSolid,
  update() {
    // ...
  },
});
