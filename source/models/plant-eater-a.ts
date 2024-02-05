import { createId } from "helpers";
import {
  createObjectCollisionManager,
  type Collidable,
  type Healthy,
  type Identifiable,
  type Updatable,
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import type { Movable } from "services/state";

export interface PlantEaterA
  extends Identifiable,
    Updatable,
    Collidable,
    Healthy,
    Movable {
  type: "plant_eater_a";
  numberOfPlantsEaten: number;
}

export function createPlantEaterA(
  o: Partial<Pick<PlantEaterA, "x" | "y">> = {},
): PlantEaterA {
  return {
    id: createId(),
    type: "plant_eater_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 10,
      selfHealing: true,
    }),
    collision: createObjectCollisionManager(),
    movement: createObjectMovementManager({
      maxSpeed: 0.03,
    }),
    targetPoint: null,
    numberOfPlantsEaten: 0,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      // Find the closest plant
      const { gameObjectsManager } = getState();
      const plants = Object.values(gameObjectsManager.objects).filter(
        (oo) => oo.type === "plant_a",
      );

      let closestPlant = null;
      let closestDistance = Infinity;

      for (const plant of plants) {
        const distance = Math.sqrt(
          (this.x - plant.x) ** 2 + (this.y - plant.y) ** 2,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPlant = plant;
        }
      }

      if (closestPlant) {
        this.targetPoint = {
          x: closestPlant.x,
          y: closestPlant.y,
        };
      } else {
        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.targetPoint && closestPlant) {
        const distance = Math.sqrt(
          (this.x - this.targetPoint.x) ** 2 +
            (this.y - this.targetPoint.y) ** 2,
        );

        if (
          distance <=
          this.collisionCircle.radius + closestPlant.collisionCircle.radius
        ) {
          gameObjectsManager.despawnObject(closestPlant);
          this.targetPoint = null;

          this.numberOfPlantsEaten += 1;

          if (this.numberOfPlantsEaten >= 20) {
            gameObjectsManager.spawnObject(
              createPlantEaterA({ x: this.x, y: this.y }),
            );
            this.numberOfPlantsEaten = 0;
          }
        }
      }
    },
  };
}
