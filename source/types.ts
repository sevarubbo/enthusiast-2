import type { Enemy, Tower, Bullet } from "./models";

export type StateObject = (
  | Enemy
  | Tower
  | Bullet
);
