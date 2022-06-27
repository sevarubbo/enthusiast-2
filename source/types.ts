import type { Enemy, Tower, Bullet, House, EnemyB, EnemyC } from "./models";

export type StateObject = (
  | Enemy
  | EnemyB
  | EnemyC
  | House
  | Tower
  | Bullet
);
