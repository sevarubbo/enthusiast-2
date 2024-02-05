import type { CameraManager } from "./cameraManager";
import type { GameObjectsManager } from "./gameObjectsManager";
import type { GameSpeedManager } from "./gameSpeedManager";
import type { ObjectCollisionManager } from "./objectCollisionManager";
import type { ObjectHealthManager } from "./objectHealthManager";
import type { ObjectMovementManager } from "./objectMovementManager";
import type { Vector } from "services/vector";

export interface State {
  cameraManager: CameraManager;
  gameSpeedManager: GameSpeedManager;
  gameObjectsManager: GameObjectsManager;
  world: {
    size: Vector;
  };
}

export interface Updatable {
  update(delta: number, getState: () => State): void;
}

export interface Identifiable {
  id: string;
}

export interface Collidable extends Vector {
  collisionCircle: {
    radius: number;
  };
  collision: ObjectCollisionManager;
}

export interface Healthy {
  health: ObjectHealthManager;
}

export interface Movable extends Vector {
  movement: ObjectMovementManager;
  targetPoint: Vector | null;
}
