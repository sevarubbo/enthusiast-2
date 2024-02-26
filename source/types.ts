import type {
  Enemy,
  Tower,
  Bullet,
  House,
  EnemyC,
  StrangerA,
  createPlantA,
} from "./models";
import type { createBloodParticle } from "./models/blood-particle";
import type { createBloodStain } from "./models/blood-stain";
import type { createHealingStationA } from "./models/healing-station-a";
import type { ShieldItem } from "./models/shield-item";
import type { createWallA } from "./models/wall-a";
import type { createWeaponBElement } from "./models/weapon-b-element";
import type { createBossA } from "models/boss-a";
import type { DefenderA } from "models/defender-a";
import type { EnemyD } from "models/enemy-d";
import type { createItemRewardA } from "models/item-reward-a";
import type { createItemShotgun } from "models/item-shotgun";
import type { PlantEaterA } from "models/plant-eater-a";
import type { ShootingEnemyA } from "models/shooting-enemy-a";
import type { createWeaponAItem } from "models/weapon-a-item";

type BloodStain = ReturnType<typeof createBloodStain>;
type BloodParticle = ReturnType<typeof createBloodParticle>;

export type StateObject =
  | Enemy
  | EnemyC
  | House
  | Tower
  | Bullet
  | StrangerA
  | ReturnType<typeof createPlantA>
  | PlantEaterA
  | ShootingEnemyA
  | DefenderA
  | ShieldItem
  | EnemyD
  | ReturnType<typeof createWeaponAItem>
  | ReturnType<typeof createItemRewardA>
  | ReturnType<typeof createItemShotgun>
  | ReturnType<typeof createBossA>
  | ReturnType<typeof createHealingStationA>
  | ReturnType<typeof createWallA>
  | ReturnType<typeof createWeaponBElement>
  | BloodStain
  | BloodParticle;

export type CollidableObject = Exclude<StateObject, BloodStain | BloodParticle>;
