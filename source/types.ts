import type { Circle, Enemy } from "./models";

export type StateObject = (
  | Circle
  | Enemy
);
