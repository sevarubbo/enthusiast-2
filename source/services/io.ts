import type { Vector } from "./vector";

let pointerPosition = { x: 0, y: 0 };

export function setPointerPosition(position: Vector) {
  pointerPosition = position;
}

export function getPointerPosition() {
  return pointerPosition;
}

export type KeyboardKey = "0" | "1" | "2";

let currentKeyPressed: KeyboardKey | null = null;

export function setKeyPressed(key: KeyboardKey | null) {
  currentKeyPressed = key;
}

export function getKeyPressed() {
  return currentKeyPressed;
}

let currentKeyUp: KeyboardKey | null = null;

export function setKeyUp(key: KeyboardKey | null) {
  currentKeyUp = key;
}

export function getKeyUp() {
  return currentKeyUp;
}
