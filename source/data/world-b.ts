import { createWorldDefaults } from "./defaults";
import {
  createHouse,
  createPlantA,
  createStrangerA,
  createTower,
} from "models";
import { createBossA } from "models/boss-a";
import { createDefenderA } from "models/defender-a";
import { createItemRewardA } from "models/item-reward-a";
import { createShieldItem } from "models/shield-item";
import { createShootingEnemyA } from "models/shooting-enemy-a";
import { createWeaponAItem } from "models/weapon-a-item";
import { createGameObjectsManager } from "services/state";
import type { State } from "services/state";

export const createWorldB = (): State => {
  const defaults = createWorldDefaults({
    worldSize: { x: 1000, y: 1000 },
  });

  return {
    ...defaults,

    gameObjectsManager: createGameObjectsManager({
      quadtree: defaults.quadtree,
      objectsArray: [
        createStrangerA(defaults.world.getRandomPoint()),
        createBossA(defaults.world.getRandomPoint()),

        createTower({ x: 100, y: 100 }),

        createShootingEnemyA(defaults.world.getRandomPoint()),

        createHouse(defaults.world.getRandomPoint()),

        createPlantA(defaults.world.getRandomPoint()),

        createWeaponAItem(defaults.world.getRandomPoint()),
        createShieldItem(defaults.world.getRandomPoint()),

        createDefenderA(defaults.world.getRandomPoint()),

        createItemRewardA(defaults.world.getRandomPoint()),
      ],
    }),
  };
};
