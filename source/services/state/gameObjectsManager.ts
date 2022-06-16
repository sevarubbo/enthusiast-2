import type { Updatable } from "./types";
import type { StateObject } from "types";

export interface GameObjectsManager extends Updatable {
  objects: Record<string, StateObject>;
}

export const createGameObjectsManager = (
  o: Partial<Pick<GameObjectsManager, "objects">>,
): GameObjectsManager => ({
  objects: o.objects || {},
  update(getState) {
    const state = getState();

    if (state.gameSpeedManager.gameSpeed > 0) {
      for (const objectId in this.objects) {
        const object = this.objects[objectId];

        if ("update" in object) {
          object.update(() => state);
        }
      }
    }
  },
});
