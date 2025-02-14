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
import type { EnemyLarva } from "models/enemy-larva";
import type { createFactoryA } from "models/factory-a";
import type { createItemRewardA } from "models/item-reward-a";
import type { createItemShotgun } from "models/item-shotgun";
import type { PlantBSeed } from "models/plant-b-seed";
import type { PlantEaterA } from "models/plant-eater-a";
import type { createRawMaterialA } from "models/raw-material-a";
import type { createRawMaterialMine } from "models/raw-material-mine";
import type { ShootingEnemyA } from "models/shooting-enemy-a";
import type { SlashingEnemyA } from "models/slashing-emeny-a";
import type { createWeaponAItem } from "models/weapon-a-item";
import type { SlashingElement } from "models/weapon-slashing";
import type { createWorkerA } from "models/worker-a";

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
  | BloodParticle
  | ReturnType<typeof createRawMaterialA>
  | ReturnType<typeof createRawMaterialMine>
  | ReturnType<typeof createWorkerA>
  | ReturnType<typeof createFactoryA>
  | SlashingEnemyA
  | SlashingElement
  | PlantBSeed
  | EnemyLarva;

export type CollidableObject = Exclude<StateObject, BloodStain | BloodParticle>;
