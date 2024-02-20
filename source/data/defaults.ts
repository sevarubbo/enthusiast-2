import { createQuadtree } from "services/quadtree";
import {
  createCameraManager,
  createGameSpeedManager,
  type State,
} from "services/state";
import { createCollisionManager } from "services/state/collisionManager";
import { createStatsManager } from "services/statsManager";
import { vector } from "services/vector";

export const createWorldDefaults = ({
  worldSize = vector.create(1000, 1000),
}: {
  worldSize: State["world"]["size"];
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

    quadtree: createQuadtree(
      {
        x: 0,
        y: 0,
        width: worldSize.x,
        height: worldSize.y,
      },
      10,
    ),

    cameraManager: createCameraManager({
      frame: {
        position: vector.create(200, 50),
        size: vector.create(window.innerWidth - 250, window.innerHeight - 100),
      },
      worldTargetPoint: vector.scale(worldSize, 0.5),
    }),

    gameSpeedManager: createGameSpeedManager(),

    statsManager: createStatsManager(),

    collisionManager: createCollisionManager(),
  }) as const;
