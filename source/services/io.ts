import type { Vector } from "./vector";

let pointerPosition = { x: 0, y: 0 };

export function setPointerPosition(position: Vector) {
  pointerPosition = position;
}

export function getPointerPosition() {
  return pointerPosition;
}
