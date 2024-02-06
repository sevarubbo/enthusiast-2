import type {
  Enemy,
  Tower,
  Bullet,
  House,
  EnemyC,
  StrangerA,
  PlantA,
} from "./models";
import type { PlantEaterA } from "models/plant-eater-a";
import type { ShootingEnemyA } from "models/shooting-enemy-a";

export type StateObject =
  | Enemy
  | EnemyC
  | House
  | Tower
  | Bullet
  | StrangerA
  | PlantA
  | PlantEaterA
  | ShootingEnemyA;
