import { createWorldDefaults } from "./defaults";
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
    }),
  };
};
