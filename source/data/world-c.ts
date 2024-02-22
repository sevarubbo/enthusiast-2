/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWorldDefaults } from "./defaults";
import { createDefenderA } from "../models/defender-a";
import { createHealingStationA } from "../models/healing-station-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createWallA } from "../models/wall-a";
import { createStrangerA } from "models";
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
        //
        createShootingEnemyA({
          x: 400,
          y: 400,
        }),
        createShootingEnemyA({
          x: 450,
          y: 450,
        }),

        createStrangerA({
          x: 100,
          y: 100,
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

        createWallA({
          x: 100,
          y: 300,
        }),
      ],
    }),
  };
};
