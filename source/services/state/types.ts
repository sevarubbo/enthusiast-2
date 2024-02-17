import type { StateObject } from "../../types";
import type { createQuadtree } from "../quadtree";
import type { CameraManager } from "./cameraManager";
import type { createCollisionManager } from "./collisionManager";
import type { GameObjectsManager } from "./gameObjectsManager";
import type { GameSpeedManager } from "./gameSpeedManager";
import type { ObjectHealthManager } from "./objectHealthManager";
import type { ObjectMovementManager } from "./objectMovementManager";
import type { ObjectCollisionManager } from "models/managers";
import type { StatsManager } from "services/statsManager";
import type { Vector } from "services/vector";

export interface State {
  quadtree: ReturnType<typeof createQuadtree>;
  cameraManager: CameraManager;
  gameSpeedManager: GameSpeedManager;
  gameObjectsManager: GameObjectsManager;
  collisionManager: ReturnType<typeof createCollisionManager>;
  statsManager: StatsManager;
  world: {
    size: Vector;

    getRandomPoint(): Vector;
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

export interface Healthy extends Identifiable {
  health: ObjectHealthManager;
}

export interface Movable extends Vector, Updatable, Identifiable {
  movement: ObjectMovementManager;
  targetPoint?: Vector | null;
}

export interface ObjectManager {
  update(delta: number, getState: () => State, object: StateObject): void;
}
