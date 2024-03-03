import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createShootingEnemyA } from "./shooting-enemy-a";
import {
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import { vector, type Vector } from "services/vector";
import type { PlantBSeed } from "./plant-b-seed";
import type { State } from "services/state";

export type EnemyLarva = ReturnType<typeof createEnemyLarva>;

export const createEnemyLarva = (position: Vector) =>
  ({
    ...createBaseObject(position),
    type: "enemy_larva",
    color: "red",
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
    collision: createObjectCollisionManager({
      circleRadius: 2,
    }),
    movement: createObjectMovementManager({
      maxSpeed: 0.05,
    }),

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);

      const nearbyPlantBSeed: PlantBSeed | null =
        state.gameObjectsManager.findClosestObject(
          this,
          (obj) => obj.type === "plant_b_seed" && obj.isFertile,
          this.collision.circleRadius * 20,
        );

      if (nearbyPlantBSeed) {
        this.movement.setTargetPoint(nearbyPlantBSeed);

        if (
          vector.distanceSquared(this, nearbyPlantBSeed) <
          (this.collision.circleRadius * 2 +
            nearbyPlantBSeed.collision.circleRadius) **
            2
        ) {
          this.movement.setTargetPoint(null);

          state.gameObjectsManager.removeObject(nearbyPlantBSeed);
          state.gameObjectsManager.addObject(createShootingEnemyA(this));
        }
      } else {
        this.movement.moveInBrownianMotion(delta, state, this);
      }
    },
  }) as const;
