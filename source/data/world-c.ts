import { createWorldDefaults } from "./defaults";
import { createHealingStationA } from "../models/healing-station-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createWallA } from "../models/wall-a";
import { createWeaponAItem } from "../models/weapon-a-item";
import { createStrangerA } from "models";
import { createShieldItem } from "models/shield-item";
import { createGameObjectsManager } from "services/state";
import type { State } from "services/state";

export const createWorldC = (): State => {
  const defaults = createWorldDefaults({
    worldSize: { x: 600, y: 600 },
  });

  return {
    ...defaults,

    gameObjectsManager: createGameObjectsManager({
      quadtree: defaults.quadtree,
      objectsArray: [
        // createDefenderA({
        //   x: 100,
        //   y: 100,
        // }),

        createShootingEnemyA({
          x: 400,
          y: 400,
        }),

        createStrangerA({
          x: 100,
          y: 200,
        }),

        createShieldItem({
          x: 200,
          y: 100,
        }),

        createWeaponAItem({
          x: 100,
          y: 100,
        }),

        createHealingStationA({
          x: 300,
          y: 300,
        }),

        createWallA({
          x: 300,
          y: 100,
        }),
      ],
    }),
  };
};
