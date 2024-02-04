import type { Enemy, Tower, Bullet, House, EnemyB, EnemyC } from "./models";
import type { StrangerA } from "models/stranger-a";

export type StateObject = (
  | Enemy
  | EnemyB
  | EnemyC
  | House
  | Tower
  | Bullet
  | StrangerA
);
