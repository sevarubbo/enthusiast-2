import { createQuadtree } from "services/quadtree";
import {
  createCameraManager,
  createGameObjectsManager,
  createGameSpeedManager,
  type State,
} from "services/state";
import { createCollisionManager } from "services/state/collisionManager";
import { createStatsManager } from "services/statsManager";
import { vector } from "services/vector";
import type { StateObject } from "types";

export const createWorldDefaults = ({
  worldSize = vector.create(1000, 1000),
  cameraTargetPoint = vector.scale(worldSize, 0.5),
  objects = [],
  quadtree = createQuadtree(
    {
      x: 0,
      y: 0,
      width: worldSize.x,
      height: worldSize.y,
    },
    10,
  ),
}: {
  worldSize: State["world"]["size"];
  cameraTargetPoint?: State["cameraManager"]["worldTargetPoint"];
  quadtree?: ReturnType<typeof createQuadtree>;
  objects?: StateObject[];
}) =>
  ({
    world: {
      size: worldSize,

      getRandomPoint() {
        return vector.create(
          Math.random() * worldSize.x,
          Math.random() * worldSize.y,
        );
      },
    },

    quadtree,

    cameraManager: createCameraManager({
      frame: {
        position: vector.create(0, 0),
        size: vector.create(window.innerWidth, window.innerHeight),
      },
      worldTargetPoint: cameraTargetPoint,
    }),

    gameSpeedManager: createGameSpeedManager(),

    statsManager: createStatsManager(),

    collisionManager: createCollisionManager(),

    gameObjectsManager: createGameObjectsManager({
      quadtree,
      objectsArray: objects,
    }),
  }) as const;
