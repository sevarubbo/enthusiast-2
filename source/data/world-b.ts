import { createWorldDefaults } from "./defaults";
import { createPlantA, createStrangerA, createTower } from "models";
import { createShootingEnemyA } from "models/shooting-enemy-a";
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

        createTower({ x: 100, y: 100 }),

        createShootingEnemyA(defaults.world.getRandomPoint()),

        createPlantA(defaults.world.getRandomPoint()),
      ],
    }),
  };
};
