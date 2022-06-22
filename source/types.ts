import type { Enemy, Tower, Bullet, House } from "./models";

export type StateObject = (
  | Enemy
  | House
  | Tower
  | Bullet
);
