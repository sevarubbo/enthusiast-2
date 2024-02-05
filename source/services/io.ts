import type { Vector } from "./vector";

let pointerPosition = { x: 0, y: 0 };

export function setPointerPosition(position: Vector) {
  pointerPosition = position;
}

export function getPointerPosition() {
  return { pointerPosition };
}

let isPointerDown = false;

export function getIsPointerDown() {
  return isPointerDown;
}

export function setIsPointerDown(value: boolean) {
  isPointerDown = value;
}

export type KeyboardKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "="
  | "-"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "w"
  | "a"
  | "s"
  | "d";

let currentKeyPressed: KeyboardKey | null = null;

const currentKeysPressed: Set<KeyboardKey> = new Set<KeyboardKey>();

export function setKeyPressed(key: KeyboardKey | null) {
  // eslint-disable-next-line no-console
  console.log("Key: ", key);
  currentKeyPressed = key;

  if (key) {
    currentKeysPressed.add(key);
  }
}

export function getKeyPressed() {
  return currentKeyPressed;
}

let currentKeyUp: KeyboardKey | null = null;

export function setKeyUp(key: KeyboardKey | null) {
  currentKeyUp = key;

  if (key) {
    currentKeysPressed.delete(key);
  }
}

export function getKeyUp() {
  return currentKeyUp;
}

export function getKeysPressed() {
  return {
    keysPressed: currentKeysPressed,
  };
}
