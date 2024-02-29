/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWorldDefaults } from "./defaults";
import { createDefenderA } from "../models/defender-a";
import { createHealingStationA } from "../models/healing-station-a";
import { createPlantEaterA } from "../models/plant-eater-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createWallA } from "../models/wall-a";
import { createHouse, createPlantA, createStrangerA } from "models";
import { createBossA } from "models/boss-a";
import { createFactoryA } from "models/factory-a";
import { createItemShotgun } from "models/item-shotgun";
import { createRawMaterialMine } from "models/raw-material-mine";
import { createShieldItem } from "models/shield-item";
import { createSlashingEnemyA } from "models/slashing-emeny-a";
import { createWorkerA } from "models/worker-a";
import { createGameObjectsManager } from "services/state";
import { createShield } from "services/state/objectShieldManager";
import type { Matrix, matrix } from "services/matrix";
import type { State } from "services/state";

export const createWorldD = (): State => {
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

        createShieldItem({
          x: 100,
          y: 100,
        }),

        createSlashingEnemyA({
          x: 300,
          y: 300,
        }),
      ],
    }),
  };
};
