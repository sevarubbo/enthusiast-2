import type { CameraManager } from "./cameraManager";
import type { GameObjectsManager } from "./gameObjectsManager";
import type { GameSpeedManager } from "./gameSpeedManager";
import type { Vector } from "services/vector";

export interface State<OT> {
  cameraManager: CameraManager;
  gameSpeedManager: GameSpeedManager;
  gameObjectsManager: GameObjectsManager<OT>;
  world: {
    size: Vector;
  };
}

export interface Updatable {
  update(getState: () => State<object>): void;
}

export interface Identifiable {
  id: string;
}
