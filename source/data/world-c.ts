import { createWorldDefaults } from "./defaults";
import { createPlantA } from "models";
import { createPlantEaterA } from "models/plant-eater-a";
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
        createPlantEaterA(defaults.world.getRandomPoint()),
        createPlantA(defaults.world.getRandomPoint()),
        createPlantA(defaults.world.getRandomPoint()),
        createPlantA(defaults.world.getRandomPoint()),
        createPlantA(defaults.world.getRandomPoint()),
        createPlantA(defaults.world.getRandomPoint()),
      ],
    }),
  };
};
