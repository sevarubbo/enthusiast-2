import { createId } from "../helpers";
import { getPointerPosition } from "../services/io";
import type { Identifiable, Updatable } from "../services/state";
import type { Vector } from "../services/vector";

export interface Circle extends Identifiable, Updatable, Vector {
  type: "circle";
  color: "green";
  radius: 20;
}

export function createCircle(): Circle {
  return {
    id: createId(),
    type: "circle",
    x: 300,
    y: 200,
    color: "green",
    radius: 20,

    update(delta, getState) {
      const pointerPosition = getPointerPosition();
      const p = getState().cameraManager.fromScreen(pointerPosition);

      this.x = p.x;
      this.y = p.y;
    },
  };
}

export * from "./enemy";
