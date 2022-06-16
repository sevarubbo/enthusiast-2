import { createGameObjectsManager } from "../services/state/gameObjectsManager";
import { createCircle, createTriangle } from "models";
import { createCameraManager } from "services/state/cameraManager";
import { createGameSpeedManager } from "services/state/gameSpeedManager";
import { vector } from "services/vector";
import type { State } from "services/state";

const circle = createCircle();
// const triangle = createTriangle();
// const triangle2 = createTriangle();
// const triangle3 = createTriangle();

export function createDefaultState(): State {
  let timeSinceLastTriangleSpawn = 0;
  const MAX_TRIANGLES = 3;

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
        // [triangle.id]: triangle,
        // [triangle2.id]: triangle2,
        // [triangle3.id]: triangle3,
      },
      update(delta, getState) {
        const gameObjectsManager = getState().gameObjectsManager;

        timeSinceLastTriangleSpawn += delta;

        let trianglesCount = 0;

        for (const id in gameObjectsManager.objects) {
          const object = gameObjectsManager.objects[id];

          trianglesCount += object.type === "triangle" ? 1 : 0;
        }

        if (trianglesCount >= MAX_TRIANGLES) {
          return;
        }

        if (timeSinceLastTriangleSpawn > 1000) {
          timeSinceLastTriangleSpawn = 0;

          gameObjectsManager.spawnObject(createTriangle());
        }
      },
    }),
  };
}
