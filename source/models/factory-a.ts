import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createShieldItem } from "./shield-item";
import { createIntervalManager, type State } from "services/state";
import type { Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

const MAX_RAW_MATERIALS = 6;

export type FactoryA = ReturnType<typeof createFactoryA>;

const PRODUCTION_TIME = 10000;

export const createFactoryA = ({
  position,
  size = 30,
  color = "green",
  getItemCreator = () => createShieldItem,
}: {
  position: Vector;
  size: number;
  color?: string;
  getItemCreator?: (
    state: State,
  ) => (position: Vector) => Identifiable & Updatable;
}) => {
  return {
    ...createBaseObject(position),
    type: "factory_a" as const,
    color,
    collision: createObjectCollisionManager({
      circleRadius: size,
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
        if (this.materials.A < 1 || this.materials.B < 1) return;

        this.productionInterval.update(delta);

        // Creates weapon A from material A + B (needs 3 of each)
        this.productionInterval.fireIfReady(() => {
          if (this.materials.A >= 1 && this.materials.B >= 1) {
            this.materials.A -= 1;
            this.materials.B -= 1;

            state.gameObjectsManager.addObject(
              getItemCreator(state)({
                x: this.x + (Math.random() - 0.5) * 40,
                y: this.y + (Math.random() - 0.5) * 40,
              }),
            );
          }
        });
      })();
    },
  };
};
