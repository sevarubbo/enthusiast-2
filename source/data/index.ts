import {
  createEnemy,
  createEnemyB,
  createEnemyC,
  createHouse,
  createTower,
} from "models";
import { createStrangerA } from "models/stranger-a";
import { createCameraManager } from "services/state/cameraManager";
import { createGameObjectsManager } from "services/state/gameObjectsManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { vector } from "services/vector";
import type { State, Updatable } from "services/state";
import type { Vector } from "services/vector";

const createEnemySpawner = (): Updatable => {
  let timeSinceLastSpawn = 0;
  const MAX_ENEMY_COUNT = 100;
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
            // case 4:
            default:
              return vector.create(0, Math.random() * world.size.y);
          }
        })();

        gameObjectsManager.spawnObject(createEnemy(enemySpawnPosition));
      }
    },
  };
};

const WORLD_SIZE = vector.create(1200, 1200);

const STRANGER_A = createStrangerA({
  x: WORLD_SIZE.x - 100,
  y: WORLD_SIZE.y - 100,
});

export function createDefaultState(): State {
  const enemySpawner = createEnemySpawner();
  const tower = createTower(vector.scale(WORLD_SIZE, 1 / 3));
  const tower2 = createTower(vector.scale(WORLD_SIZE, 2 / 3));
  const tower3 = createTower(
    vector.create((WORLD_SIZE.x * 3) / 4, WORLD_SIZE.y / 4),
  );
  const house = createHouse(vector.scale(WORLD_SIZE, 1 / 6));
  const HOUSE_2 = createHouse(
    vector.create(WORLD_SIZE.x / 2, WORLD_SIZE.y / 1.5),
  );

  return {
    world: {
      size: WORLD_SIZE,
    },
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 150),
        size: vector.create(700, 700),
      },
      worldTargetPoint: vector.create(STRANGER_A.x, STRANGER_A.y),
    }),
    gameObjectsManager: createGameObjectsManager({
      objectsArray: [
        createEnemyB(vector.create(0, WORLD_SIZE.y)),
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
          const pos = {
            x: Math.random() * WORLD_SIZE.x,
            y: Math.random() * WORLD_SIZE.y,
          };

          return createEnemyC(pos);
        }),
        tower,
        tower2,
        tower3,
        house,
        HOUSE_2,
        STRANGER_A,
      ],
      update(delta, getState) {
        enemySpawner.update(delta, getState);
      },
    }),
  };
}
