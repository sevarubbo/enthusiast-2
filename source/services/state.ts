import type { CameraManager } from "./cameraManager";
import type { GameSpeedManager } from "./gameSpeedManager";
import type { Vector } from "./vector";

export interface Identifiable {
  id: string;
}

export interface State<OT> {
  gameSpeedManager: GameSpeedManager;
  world: {
    size: Vector;
  };
  cameraManager: CameraManager;
  objects: Record<string, OT>;
}

export interface Updatable {
  update(getState: () => State<object>): void;
}
