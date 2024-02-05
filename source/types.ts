import type {
  Enemy,
  Tower,
  Bullet,
  House,
  EnemyB,
  EnemyC,
  StrangerA,
  PlantA,
} from "./models";
import type { PlantEaterA } from "models/plant-eater-a";

export type StateObject =
  | Enemy
  | EnemyB
  | EnemyC
  | House
  | Tower
  | Bullet
  | StrangerA
  | PlantA
  | PlantEaterA;
