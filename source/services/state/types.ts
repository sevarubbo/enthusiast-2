import type { StateObject } from "../../types";
import type { createQuadtree } from "../quadtree";
import type { CameraManager } from "./cameraManager";
import type { createCollisionManager } from "./collisionManager";
import type { GameObjectsManager } from "./gameObjectsManager";
import type { GameSpeedManager } from "./gameSpeedManager";
import type { ObjectHealthManager } from "./objectHealthManager";
import type { ObjectMovementManager } from "./objectMovementManager";
import type { ObjectCollisionManager } from "models/managers";
import type { createMachineGunB, createWeaponA } from "models/weapon-a";
import type { createStatsManager } from "services/statsManager";
import type { Vector } from "services/vector";

export interface State {
  quadtree: ReturnType<typeof createQuadtree>;
  cameraManager: CameraManager;
  gameSpeedManager: GameSpeedManager;
  gameObjectsManager: GameObjectsManager;
  collisionManager: ReturnType<typeof createCollisionManager>;
  statsManager: ReturnType<typeof createStatsManager>;
  world: {
    size: Vector;

    getRandomPoint(): Vector;
  };
}

export interface Updatable {
  update(delta: number, state: State): void;
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

  /** @deprecated */
  targetPoint?: Vector | null;
}

export interface ObjectManager {
  update(delta: number, state: State, object: StateObject): void;
}

export type Weapon =
  | ReturnType<typeof createWeaponA>
  | ReturnType<typeof createMachineGunB>;
