import { createGameObjectsManager } from "../services/state/gameObjectsManager";
import { createCircle, createEnemy } from "models";
import { createCameraManager } from "services/state/cameraManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { vector } from "services/vector";
import type { State, Updatable } from "services/state";
import type { Vector } from "services/vector";

const circle = createCircle();

const createEnemySpawner = (): Updatable => {
  let timeSinceLastSpawn = 0;
  const MAX_ENEMY_COUNT = 40;
  const SPAWN_FREQUENCY = 1 / 2000;

  return {
    update(delta, getState) {
      const { gameObjectsManager, world } = getState();

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

        const enemySpawnPosition = ((): Vector => {
          const side = Math.round(Math.random() * 4) as 1 | 2 | 3 | 4;

          switch (side) {
            case 1:
              return vector.create(Math.random() * world.size.x, 0);
            case 2:
              return vector.create(world.size.x, Math.random() * world.size.y);
            case 3:
              return vector.create(Math.random() * world.size.x, world.size.y);
            case 4:
              return vector.create(0, Math.random() * world.size.y);
          }

          return vector.create(0, 0);
        })();

        gameObjectsManager.spawnObject(createEnemy(enemySpawnPosition));
      }
    },
  };
};

export function createDefaultState(): State {
  const enemySpawner = createEnemySpawner();

  return {
    world: {
      size: { x: 600, y: 600 },
    },
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 200),
        size: vector.create(700, 700),
      },
      worldTargetPoint: vector.create(300, 300),
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
