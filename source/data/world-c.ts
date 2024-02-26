/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWorldDefaults } from "./defaults";
import { createDefenderA } from "../models/defender-a";
import { createHealingStationA } from "../models/healing-station-a";
import { createPlantEaterA } from "../models/plant-eater-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createWallA } from "../models/wall-a";
import { createPlantA, createStrangerA } from "models";
import { createBossA } from "models/boss-a";
import { createItemShotgun } from "models/item-shotgun";
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

      update(delta, state) {
        // Ensure at least one plant
        if (
          state.gameObjectsManager.findObjectsByType("plant_a").length === 0
        ) {
          state.gameObjectsManager.spawnObject(
            createPlantA(state.world.getRandomPoint()),
          );
        }
      },

      objectsArray: [
        // createDefenderA({
        //   x: 200,
        //   y: 200,
        // }),
        //
        // createShootingEnemyA({
        //   x: 400,
        //   y: 400,
        // }),
        // createShootingEnemyA({
        //   x: 450,
        //   y: 450,
        // }),

        createStrangerA({
          x: 100,
          y: 100,
        }),

        createPlantA({
          x: 300,
          y: 300,
        }),
        createPlantA({
          x: 500,
          y: 300,
        }),

        // createPlantEaterA({
        //   x: 600,
        //   y: 600,
        // }),

        createBossA({
          x: 300,
          y: 300,
        }),

        // createShieldItem({
        //   x: 200,
        //   y: 100,
        // }),
        //
        // createWeaponAItem({
        //   x: 100,
        //   y: 100,
        // }),
        //
        // createHealingStationA({
        //   x: 300,
        //   y: 300,
        // }),

        // createItemShotgun({
        //   x: 100,
        //   y: 200,
        // }),
        //
        // createWallA({
        //   x: 100,
        //   y: 300,
        // }),
      ],
    }),
  };
};
