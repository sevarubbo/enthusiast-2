import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createShieldItem } from "./shield-item";
import { createIntervalManager, type State } from "services/state";
import type { Vector } from "services/vector";

const MAX_RAW_MATERIALS = 6;

export type FactoryA = ReturnType<typeof createFactoryA>;

const PRODUCTION_TIME = 10000;

export const createFactoryA = (position: Vector) => {
  return {
    ...createBaseObject(position),
    type: "factory_a" as const,
    color: "green",
    collision: createObjectCollisionManager({
      circleRadius: 50,
      isFixed: true,
    }),
    materials: {
      A: 0,
      B: 0,
    },

    productionInterval: createIntervalManager(PRODUCTION_TIME, false),

    addMaterial(materialType: "A" | "B") {
      if (this.materials[materialType] >= MAX_RAW_MATERIALS) {
        return false;
      }

      this.materials[materialType]++;

      return true;
    },

    update(delta: number, state: State) {
      (() => {
        if (this.materials.A < 3 || this.materials.B < 3) return;

        this.productionInterval.update(delta);

        // Creates weapon A from material A + B (needs 3 of each)
        this.productionInterval.fireIfReady(() => {
          if (this.materials.A >= 3 && this.materials.B >= 3) {
            this.materials.A -= 3;
            this.materials.B -= 3;

            state.gameObjectsManager.spawnObject(
              createShieldItem({
                x: this.x + Math.random() * 20 - 10,
                y: this.y + Math.random() * 20 - 10,
              }),
            );
          }
        });
      })();
    },
  };
};
