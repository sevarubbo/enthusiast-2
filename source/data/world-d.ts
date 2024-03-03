/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWorldDefaults } from "./defaults";
import { createDefenderA } from "../models/defender-a";
import { createHealingStationA } from "../models/healing-station-a";
import { createPlantEaterA } from "../models/plant-eater-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createWallA } from "../models/wall-a";
import {
  createHouse,
  createPlantA,
  createStrangerA,
  createTower,
} from "models";
import { createBossA } from "models/boss-a";
import { createEnemyFactoryA } from "models/enemy-factory-a";
import { createEnemyLarva } from "models/enemy-larva";
import { createFactoryA } from "models/factory-a";
import { createItemShotgun } from "models/item-shotgun";
import { createPlantBSeed } from "models/plant-b-seed";
import { createRawMaterialMine } from "models/raw-material-mine";
import { createShieldItem } from "models/shield-item";
import { createSlashingEnemyA } from "models/slashing-emeny-a";
import { createWeaponAItem } from "models/weapon-a-item";
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
        // // Ensure at least one plant
        // if (
        //   state.gameObjectsManager.findObjectsByType("plant_a").length === 0
        // ) {
        //   state.gameObjectsManager.spawnObject(
        //     createPlantA(state.world.getRandomPoint()),
        //   );
        // }
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

        createPlantBSeed({ x: 300, y: 300 }),
        createPlantBSeed({ x: 500, y: 300 }),
        createPlantBSeed({ x: 300, y: 500 }),

        createRawMaterialMine({
          position: { x: 200, y: 200 },
          materialType: "A",
        }),

        createRawMaterialMine({
          position: { x: 400, y: 400 },
          materialType: "A",
        }),

        createRawMaterialMine({
          position: { x: 200, y: 400 },
          materialType: "B",
        }),

        createRawMaterialMine({
          position: { x: 50, y: 50 },
          materialType: "A",
        }),

        createRawMaterialMine({
          position: { x: 500, y: 500 },
          materialType: "B",
        }),

        createEnemyFactoryA({
          x: 500,
          y: 200,
        }),

        createWorkerA({
          x: 500,
          y: 500,
        }),

        createShieldItem({
          x: 100,
          y: 100,
        }),

        createWeaponAItem({ x: 100, y: 100 }),

        createEnemyLarva({
          x: 300,
          y: 300,
        }),
        createEnemyLarva({
          x: 300,
          y: 300,
        }),

        // createWallA({
        //   x: 100,
        //   y: 100,
        // }),

        // createTower({
        //   x: 300,
        //   y: 300,
        // }),

        // createSlashingEnemyA({
        //   x: 300,
        //   y: 300,
        // }),
        //
        // createSlashingEnemyA({
        //   x: 300,
        //   y: 300,
        // }),
      ],
    }),
  };
};
