import { createWorldDefaults } from "./defaults";
import { createStrangerA } from "models";
import { createBossA } from "models/boss-a";
import { createShieldItem } from "models/shield-item";
import { createWeaponAItem } from "models/weapon-a-item";
import { createGameObjectsManager } from "services/state";
import type { State } from "services/state";

export const createWorldC = (): State => {
  const defaults = createWorldDefaults({
    worldSize: { x: 500, y: 500 },
  });

  return {
    ...defaults,

    gameObjectsManager: createGameObjectsManager({
      quadtree: defaults.quadtree,
      objectsArray: [
        createBossA(defaults.world.getRandomPoint()),
        createStrangerA(defaults.world.getRandomPoint()),
        createWeaponAItem(defaults.world.getRandomPoint()),
        createWeaponAItem(defaults.world.getRandomPoint()),
        createWeaponAItem(defaults.world.getRandomPoint()),
        createWeaponAItem(defaults.world.getRandomPoint()),
        createShieldItem(defaults.world.getRandomPoint()),
        createShieldItem(defaults.world.getRandomPoint()),
      ],
    }),
  };
};
