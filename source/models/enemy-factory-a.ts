import { createFactoryA } from "./factory-a";
import { createSlashingEnemyA } from "./slashing-emeny-a";
import { createWorkerA } from "./worker-a";
import type { Vector } from "services/vector";

export const createEnemyFactoryA = (position: Vector) => {
  return createFactoryA({
    position,
    size: 30,
    color: "black",
    getItemCreator: (state) => {
      const slashingEnemies =
        state.gameObjectsManager.findObjectsByType("slashing_enemy_a");
      const workers = state.gameObjectsManager.findObjectsByType("worker_a");

      if (slashingEnemies.length > workers.length) {
        return createWorkerA;
      }

      return createSlashingEnemyA;
    },
  });
};
