import { createGameObjectsManager } from "../services/state/gameObjectsManager";
import { createCircle, createEnemy } from "models";
import { createCameraManager } from "services/state/cameraManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { vector } from "services/vector";
import type { State, Updatable } from "services/state";

const circle = createCircle();

const createEnemySpawner = (): Updatable => {
  let timeSinceLastSpawn = 0;
  const MAX_ENEMY_COUNT = 4;
  const SPAWN_FREQUENCY = 1;

  return {
    update(delta, getState) {
      const { gameObjectsManager } = getState();

      timeSinceLastSpawn += delta;

      let enemyCount = 0;

      for (const id in gameObjectsManager.objects) {
        const object = gameObjectsManager.objects[id];

        enemyCount += object.type === "enemy" ? 1 : 0;
      }

      if (enemyCount >= MAX_ENEMY_COUNT) {
        return;
      }

      if (timeSinceLastSpawn > 1 / SPAWN_FREQUENCY) {
        timeSinceLastSpawn = 0;

        gameObjectsManager.spawnObject(createEnemy());
      }
    },
  };
};

export function createDefaultState(): State {
  const enemySpawner = createEnemySpawner();

  return {
    world: {
      size: { x: 700, y: 700 },
    },
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 200),
        size: vector.create(500, 500),
      },
      worldTargetPoint: vector.create(350, 350),
    }),
    gameObjectsManager: createGameObjectsManager({
      objects: {
        [circle.id]: circle,
      },
      update(delta, getState) {
        enemySpawner.update(delta, getState);
      },
    }),
  };
}
