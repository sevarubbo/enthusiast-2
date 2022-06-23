import type { Enemy, Tower, Bullet, House, EnemyB } from "./models";

export type StateObject = (
  | Enemy
  | EnemyB
  | House
  | Tower
  | Bullet
);
