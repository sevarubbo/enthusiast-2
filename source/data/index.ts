import { createShieldItem } from "../models/shield-item";
import {
  createEnemy,
  createEnemyC,
  createHouse,
  createPlantA,
  createTower,
} from "models";
import { createDefenderA } from "models/defender-a";
import { createPlantEaterA } from "models/plant-eater-a";
import { createShootingEnemyA } from "models/shooting-enemy-a";
import { createStrangerA } from "models/stranger-a";
import { createCameraManager } from "services/state/cameraManager";
import { createGameObjectsManager } from "services/state/gameObjectsManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { createStatsManager } from "services/statsManager";
import { vector } from "services/vector";
import type { State, Updatable } from "services/state";
import type { Vector } from "services/vector";

const createEnemySpawner = (): Updatable => {
  let timeSinceLastSpawn = 0;
  // const MAX_ENEMY_COUNT = 100;
  const SPAWN_FREQUENCY = 1 / 2000;

  return {
    update(delta, getState) {
      const { gameObjectsManager, world } = getState();

      timeSinceLastSpawn += delta;

      // let enemyCount = 0;

      // for (const id in gameObjectsManager.objects) {
      //   const object = gameObjectsManager.getObject(id);

      //   enemyCount += object.type === "enemy" ? 1 : 0;
      // }

      // if (enemyCount >= MAX_ENEMY_COUNT) {
      //   return;
      // }

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

        // If there are no plants, spawn a plant
        const plants = Object.values(gameObjectsManager.objects).filter(
          (oo) => oo.type === "plant_a",
        );

        if (plants.length === 0) {
          gameObjectsManager.spawnObject(
            createPlantA({
              x: Math.random() * world.size.x,
              y: Math.random() * world.size.y,
            }),
          );
        }

        // Same for plant eaters
        const plantEaters = Object.values(gameObjectsManager.objects).filter(
          (oo) => oo.type === "plant_eater_a",
        );

        if (plantEaters.length === 0) {
          gameObjectsManager.spawnObject(
            createPlantEaterA({
              x: Math.random() * world.size.x,
              y: Math.random() * world.size.y,
            }),
          );
        }
      }
    },
  };
};

const WORLD_SIZE = vector.create(2400, 2400);

const getRandomPosition = () => ({
  x: Math.random() * WORLD_SIZE.x,
  y: Math.random() * WORLD_SIZE.y,
});

const STRANGER_A = createStrangerA(getRandomPosition());

export function createDefaultState(): State {
  const enemySpawner = createEnemySpawner();
  const tower = createTower(getRandomPosition());
  const tower2 = createTower(getRandomPosition());
  const tower3 = createTower(getRandomPosition());
  const house = createHouse(getRandomPosition());
  const HOUSE_2 = createHouse(getRandomPosition());

  return {
    statsManager: createStatsManager(),
    world: {
      size: WORLD_SIZE,
      getRandomPoint: () => ({
        x: Math.random() * WORLD_SIZE.x,
        y: Math.random() * WORLD_SIZE.y,
      }),
    },
    gameSpeedManager: createGameSpeedManager(),
    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 50),
        size: vector.create(window.innerWidth - 250, window.innerHeight - 100),
      },
      worldTargetPoint: vector.create(STRANGER_A.x, STRANGER_A.y),
    }),
    gameObjectsManager: createGameObjectsManager({
      objectsArray: [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() => {
          const pos = {
            x: Math.random() * WORLD_SIZE.x,
            y: Math.random() * WORLD_SIZE.y,
          };

          return createEnemyC(pos);
        }),
        tower,
        tower2,
        tower3,

        createTower(getRandomPosition()),
        createTower(getRandomPosition()),
        createTower(getRandomPosition()),

        house,
        HOUSE_2,
        STRANGER_A,

        createPlantA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createPlantA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createPlantEaterA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createPlantEaterA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createPlantEaterA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createShootingEnemyA(getRandomPosition()),
        createShootingEnemyA(getRandomPosition()),

        createDefenderA({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createShieldItem({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createShieldItem({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createShieldItem({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),

        createShieldItem({
          x: Math.random() * WORLD_SIZE.x,
          y: Math.random() * WORLD_SIZE.y,
        }),
      ],

      update(delta, getState) {
        enemySpawner.update(delta, getState);
      },
    }),
  };
}
