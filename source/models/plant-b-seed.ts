import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import {
  createIntervalManager,
  createObjectMovementManager,
} from "services/state";
import type { State } from "services/state";
import type { Vector } from "services/vector";

export type PlantBSeed = ReturnType<typeof createPlantBSeed>;

export const createPlantBSeed = (position: Vector) => {
  let energy = 0;
  let size = 1;
  const minGrowEnergy = 4;
  const maxEnergyToStore = 20;
  const minSeedEnergy = maxEnergyToStore * 0.8;
  const maxSize = 10;

  return {
    ...createBaseObject(position),
    type: "plant_b_seed" as const,
    color: "green",
    collision: createObjectCollisionManager({
      circleRadius: size,
      isSolid: false as boolean,
    }),
    movement: createObjectMovementManager({
      maxSpeed: 0.05,
    }),
    seedInterval: createIntervalManager(10000, false),
    mode: "seed" as "seed" | "growing",
    get energy() {
      return energy;
    },
    get isFertile() {
      return size >= maxSize / 2 && energy >= minSeedEnergy;
    },

    update(delta: number, state: State) {
      this.movement.update(delta, state, this);
      this.seedInterval.update(delta);

      this.collision.circleRadius = size;
      this.collision.isSolid = this.mode === "growing";

      const METABOLISM = 0.00004 * size;

      if (this.mode === "seed") {
        this.movement.moveInBrownianMotion(delta, state, this);

        // seedAge += delta;

        // if (seedAge > maxSeedAge) {
        //   state.gameObjectsManager.removeObject(this);
        // }

        const nearbySeed = state.quadtree
          .queryRadius(this, this.collision.circleRadius * 2)
          .find(
            (o) => o.type === "plant_b_seed" && o !== this && o.mode === "seed",
          );

        if (nearbySeed && nearbySeed !== this) {
          state.gameObjectsManager.removeObject(nearbySeed);
        }
      }

      const nearbyMaterialA = state.quadtree
        .queryRadius(this, this.collision.circleRadius * 4)
        .find((o) => o.type === "raw_material_a");

      if (nearbyMaterialA) {
        this.movement.setTargetPoint(null);
        this.mode = "growing";

        if (energy < maxEnergyToStore) {
          state.gameObjectsManager.removeObject(nearbyMaterialA);
          energy += 6;
        }
      }

      if (this.mode === "growing") {
        if (energy > 0) {
          if (energy >= minGrowEnergy && size < maxSize) {
            size += (delta * METABOLISM) / size;
            energy -= delta * METABOLISM;
          } else {
            energy -= (delta * METABOLISM) / 2;
          }
        }

        if (energy < 0) {
          state.gameObjectsManager.removeObject(this);
        }
      }

      if (this.isFertile) {
        this.seedInterval.fireIfReady(() => {
          state.gameObjectsManager.addObject(createPlantBSeed(this));

          energy -= 1;
        });
      }

      // console.log("size", size);
      // console.log("energy", energy);
      // console.log("mode", mode);
    },
  };
};
