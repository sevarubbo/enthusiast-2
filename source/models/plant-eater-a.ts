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
import type { Bullet } from "./bullet";
import type { PlantA } from "./plant-a";
import type { Movable } from "services/state";

export interface PlantEaterA
  extends Identifiable,
    Updatable,
    Collidable,
    Healthy,
    Movable {
  type: "plant_eater_a";
  numberOfPlantsEaten: number;
  color: string;
  targetEnemy: (Healthy & Collidable) | undefined;
}

export function createPlantEaterA(
  o: Partial<Pick<PlantEaterA, "x" | "y">> = {},
): PlantEaterA {
  return {
    color: "#a00",
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
    targetEnemy: undefined,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      // Find the closest plant
      const { gameObjectsManager } = getState();
      const plants = Object.values(gameObjectsManager.objects).filter(
        (oo) => oo.type === "plant_a",
      ) as PlantA[];

      const collisions = this.collision.collidesWithObjects;
      const bullet = collisions.find((oo) => oo.type === "bullet") as
        | Bullet
        | undefined;

      if (bullet) {
        const whoSHot = gameObjectsManager.objects[bullet.belongsTo] as
          | (Healthy & Collidable)
          | undefined;

        this.targetEnemy = whoSHot;
      }

      if (
        this.targetEnemy &&
        !gameObjectsManager.objects[this.targetEnemy.id]
      ) {
        this.targetEnemy = undefined;
      }

      if (!this.targetEnemy) {
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

        this.targetEnemy = closestPlant || undefined;
      }

      if (this.targetEnemy) {
        this.targetPoint = {
          x: this.targetEnemy.x,
          y: this.targetEnemy.y,
        };
      } else {
        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.targetPoint && this.targetEnemy) {
        const distance = Math.sqrt(
          (this.x - this.targetPoint.x) ** 2 +
            (this.y - this.targetPoint.y) ** 2,
        );

        if (
          distance <=
          this.collisionCircle.radius + this.targetEnemy.collisionCircle.radius
        ) {
          this.targetEnemy.health.current -= 0.2;

          if (this.targetEnemy.health.current <= 0) {
            this.numberOfPlantsEaten += 1;

            if (this.numberOfPlantsEaten >= 20) {
              gameObjectsManager.spawnObject(
                createPlantEaterA({ x: this.x, y: this.y }),
              );
              this.numberOfPlantsEaten = 0;
            }

            this.targetPoint = null;
          }
        }
      }
    },
  };
}
