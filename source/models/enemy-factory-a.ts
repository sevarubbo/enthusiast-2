import { createFactoryA } from "./factory-a";
import { createSlashingEnemyA } from "./slashing-emeny-a";
import { createWorkerA } from "./worker-a";
import type { Vector } from "services/vector";

export const createEnemyFactoryA = (position: Vector) => {
  let minWorkers = 1;
  let minWorkerIncremented = false;

  return createFactoryA({
    position,
    size: 30,
    color: "black",
    getItemCreator: (state) => {
      const slashingEnemies =
        state.gameObjectsManager.findObjectsByType("slashing_enemy_a");
      const workers = state.gameObjectsManager.findObjectsByType("worker_a");

      // If enemies are getting killed too fast, spawn more workers
      if (slashingEnemies.length === 0 && !minWorkerIncremented) {
        minWorkers += 1;
        minWorkerIncremented = true;
      }

      if (
        workers.length < minWorkers ||
        slashingEnemies.length > workers.length
      ) {
        return createWorkerA;
      }

      minWorkerIncremented = false;

      return createSlashingEnemyA;
    },
  });
};
