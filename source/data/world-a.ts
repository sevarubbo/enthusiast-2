import { createWorldDefaults } from "./defaults";
import { createHealingStationA } from "../models/healing-station-a";
import { createShieldItem } from "../models/shield-item";
import { createWallA } from "../models/wall-a";
import { createQuadtree } from "../services/quadtree";
import { createCollisionManager } from "../services/state/collisionManager";
import { createEnemyC, createHouse, createPlantA, createTower } from "models";
import { createBossA } from "models/boss-a";
import { createDefenderA } from "models/defender-a";
import { createEnemyFactoryA } from "models/enemy-factory-a";
import { createItemShotgun } from "models/item-shotgun";
import { createPlantBSeed } from "models/plant-b-seed";
import { createPlantEaterA } from "models/plant-eater-a";
import { createRawMaterialMine } from "models/raw-material-mine";
import { createStrangerA } from "models/stranger-a";
import { createWeaponAItem } from "models/weapon-a-item";
import { createWorkerA } from "models/worker-a";
import { createGameObjectsManager } from "services/state/gameObjectsManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { createStatsManager } from "services/statsManager";
import { vector } from "services/vector";
import type { State, Updatable } from "services/state";

const createEnemySpawner = (): Updatable => {
  let timeSinceLastSpawn = 0;
  // const MAX_ENEMY_COUNT = 100;
  const SPAWN_FREQUENCY = 1 / 3000;

  return {
    update(delta, state) {
      const { gameObjectsManager, world } = state;

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

        // const enemySpawnPosition = ((): Vector => {
        //   const side = Math.round(Math.random() * 4) as 1 | 2 | 3 | 4;

        //   switch (side) {
        //     case 1:
        //       return vector.create(Math.random() * world.size.x, 0);
        //     case 2:
        //       return vector.create(world.size.x, Math.random() * world.size.y);
        //     case 3:
        //       return vector.create(Math.random() * world.size.x, world.size.y);
        //     // case 4:
        //     default:
        //       return vector.create(0, Math.random() * world.size.y);
        //   }
        // })();

        // gameObjectsManager.spawnObject(createEnemy(enemySpawnPosition));

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

const getRandomPositionInCorner = (corner: number, margin = 200) => {
  corner = (corner % 4) + 1;

  switch (corner) {
    case 1:
      return {
        x: margin + Math.random() * (WORLD_SIZE.x / 3 - margin * 2),
        y: margin + Math.random() * (WORLD_SIZE.y / 3 - margin * 2),
      };
    case 2:
      return {
        x:
          WORLD_SIZE.x / 2 +
          margin +
          Math.random() * (WORLD_SIZE.x / 2 - margin * 2),
        y: margin + Math.random() * (WORLD_SIZE.y / 2 - margin * 2),
      };
    case 3:
      return {
        x:
          WORLD_SIZE.x / 2 +
          margin +
          Math.random() * (WORLD_SIZE.x / 2 - margin * 2),
        y:
          WORLD_SIZE.y / 2 +
          margin +
          Math.random() * (WORLD_SIZE.y / 2 - margin * 2),
      };
    default:
      return {
        x: margin + Math.random() * (WORLD_SIZE.x / 2 - margin * 2),
        y:
          WORLD_SIZE.y / 2 +
          margin +
          Math.random() * (WORLD_SIZE.y / 2 - margin * 2),
      };
  }
};

const STRANGER_CORNER = Math.ceil(Math.random() * 4) as 1 | 2 | 3 | 4;
const BOSS_CORNER = (((STRANGER_CORNER + 1) % 4) + 1) as 1 | 2 | 3 | 4;

const STRANGER_A = createStrangerA(getRandomPositionInCorner(STRANGER_CORNER));

export function createWorldA(): State {
  const enemySpawner = createEnemySpawner();
  const house = createHouse(getRandomPosition());
  const HOUSE_2 = createHouse(getRandomPosition());
  const quadtree = createQuadtree(
    {
      x: 0,
      y: 0,
      width: WORLD_SIZE.x,
      height: WORLD_SIZE.y,
    },
    10,
  );

  return {
    ...createWorldDefaults({
      worldSize: WORLD_SIZE,
      cameraTargetPoint: STRANGER_A,
      quadtree,
    }),
    statsManager: createStatsManager(),
    collisionManager: createCollisionManager(),
    world: {
      size: WORLD_SIZE,
      getRandomPoint: () => ({
        x: Math.random() * WORLD_SIZE.x,
        y: Math.random() * WORLD_SIZE.y,
      }),
    },
    gameSpeedManager: createGameSpeedManager(),

    gameObjectsManager: createGameObjectsManager({
      quadtree,
      objectsArray: [
        STRANGER_A,
        createWeaponAItem(getRandomPositionInCorner(STRANGER_CORNER)),
        createShieldItem(getRandomPositionInCorner(STRANGER_CORNER)),
        createDefenderA(getRandomPositionInCorner(STRANGER_CORNER)),
        createWeaponAItem(getRandomPositionInCorner(STRANGER_CORNER)),
        createShieldItem(getRandomPositionInCorner(STRANGER_CORNER)),
        createItemShotgun(getRandomPositionInCorner(STRANGER_CORNER)),

        createBossA(getRandomPositionInCorner(BOSS_CORNER)),

        createHealingStationA(getRandomPositionInCorner(STRANGER_CORNER, 500)),
        createTower(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createTower(getRandomPositionInCorner(STRANGER_CORNER - 1)),
        createEnemyFactoryA(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createRawMaterialMine({
          position: getRandomPositionInCorner(STRANGER_CORNER - 1),
          materialType: "A",
        }),
        createRawMaterialMine({
          position: getRandomPositionInCorner(STRANGER_CORNER),
          materialType: "B",
        }),
        createWorkerA(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createWorkerA(getRandomPositionInCorner(STRANGER_CORNER - 1)),

        createPlantBSeed(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createPlantBSeed(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createPlantBSeed(getRandomPositionInCorner(STRANGER_CORNER + 1)),
        createRawMaterialMine({
          position: getRandomPositionInCorner(STRANGER_CORNER + 1),
          materialType: "A",
        }),

        // Plants
        ...([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 5] as const).map(
          (i) => {
            return createPlantA(getRandomPositionInCorner(i));
          },
        ),

        // Plants eaters
        ...([1, 2, 3, 4, 1, 2, 3] as const).map((i) => {
          return createPlantEaterA(getRandomPositionInCorner(i));
        }),

        // Walls
        ...[1, 2, 3, 4, 5, 6].map(() => {
          return createWallA(
            getRandomPosition(),
            vector.create(Math.random() * 100 + 10, Math.random() * 100 + 10),
          );
        }),

        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() => {
          const pos = {
            x: Math.random() * WORLD_SIZE.x,
            y: Math.random() * WORLD_SIZE.y,
          };

          return createEnemyC(pos);
        }),

        house,
        HOUSE_2,
      ],

      update(delta, state) {
        enemySpawner.update(delta, state);
      },
    }),
  };
}
