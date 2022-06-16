import type { Updatable } from "./types";
import type { Vector } from "services/vector";

type DefaultGameObject = Updatable | Vector | object;

export interface GameObjectsManager<OT = DefaultGameObject> extends Updatable {
  objects: Record<string, OT>;
}

export const createGameObjectsManager = <OT extends DefaultGameObject = DefaultGameObject>(
  o: Partial<Pick<GameObjectsManager<OT>, "objects">>,
): GameObjectsManager<OT> => ({
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
