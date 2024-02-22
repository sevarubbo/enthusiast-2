import type {
  Enemy,
  Tower,
  Bullet,
  House,
  EnemyC,
  StrangerA,
  PlantA,
} from "./models";
import type { ShieldItem } from "./models/shield-item";
import type { createBossA } from "models/boss-a";
import type { DefenderA } from "models/defender-a";
import type { EnemyD } from "models/enemy-d";
import type { createItemRewardA } from "models/item-reward-a";
import type { PlantEaterA } from "models/plant-eater-a";
import type { ShootingEnemyA } from "models/shooting-enemy-a";
import type { createWeaponAItem } from "models/weapon-a-item";

export type StateObject =
  | Enemy
  | EnemyC
  | House
  | Tower
  | Bullet
  | StrangerA
  | PlantA
  | PlantEaterA
  | ShootingEnemyA
  | DefenderA
  | ShieldItem
  | EnemyD
  | ReturnType<typeof createWeaponAItem>
  | ReturnType<typeof createItemRewardA>
  | ReturnType<typeof createBossA>;
