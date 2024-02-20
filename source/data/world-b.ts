import { createWorldDefaults } from "./defaults";
import { createStrangerA, createTower } from "models";
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
        createStrangerA({ x: 500, y: 500 }),

        createTower({ x: 100, y: 100 }),
      ],
    }),
  };
};
