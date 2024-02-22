import { createWorldDefaults } from "./defaults";
import { createDefenderA } from "../models/defender-a";
import { createShootingEnemyA } from "../models/shooting-enemy-a";
import { createStrangerA } from "models";
import { createShieldItem } from "models/shield-item";
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
        createDefenderA({
          x: 100,
          y: 100,
        }),

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
      ],
    }),
  };
};
