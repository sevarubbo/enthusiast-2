import { createShootingEnemyA } from "./shooting-enemy-a";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import {
  createObjectCollisionManager,
  type Collidable,
  type Healthy,
  type Identifiable,
  type Updatable,
  createObjectHealthManager,
  createObjectMovementManager,
  createIntervalManager,
} from "services/state";
import type { Bullet } from "./bullet";
import type { PlantA } from "./plant-a";
import type { Movable } from "services/state";
import type { StateObject } from "types";

export interface PlantEaterA
  extends Identifiable,
    Updatable,
    Collidable,
    Healthy,
    Movable {
  type: "plant_eater_a";
  numberOfPlantsEaten: number;
  color: string;
  targetEnemy: StateObject | undefined;
  attack: number;
  lookAroundInterval: ReturnType<typeof createIntervalManager>;
  shield: ReturnType<typeof createObjectShieldManager>;
  growthInterval: ReturnType<typeof createIntervalManager>;
  biteInterval: ReturnType<typeof createIntervalManager>;
  age: number;
  adultAge: number;
  attackRange: number;
  maxAge: number;
  collisionCircle: { radius: number };
}

const BASE_ATTACK = 1.6;
const BASE_SPEED = 0.002;
const MAX_AGE = 10;
const MAX_REPRODUCTION_AGE = 8;
const BASE_HEALTH = 4;

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
    collision: createObjectCollisionManager({
      circleRadius: 12,
    }),
    movement: createObjectMovementManager({
      maxSpeed: 0.03,
    }),
    targetPoint: null,
    numberOfPlantsEaten: 0,
    targetEnemy: undefined,
    attack: 100,
    lookAroundInterval: createIntervalManager(10000),
    growthInterval: createIntervalManager(10000),
    biteInterval: createIntervalManager(500),
    age: 1,
    adultAge: MAX_AGE,
    maxAge: MAX_AGE * 3,
    shield: createObjectShieldManager(),
    attackRange: 0,

    update(delta, state) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.lookAroundInterval.update(delta, state);
      this.growthInterval.update(delta, state);
      this.biteInterval.update(delta, state);

      // Find the closest plant
      const { gameObjectsManager } = state;

      const collisions = this.collision.collidesWithObjects;
      const bullet = collisions.find((oo) => oo.type === "bullet") as
        | Bullet
        | undefined;

      if (bullet) {
        this.targetEnemy = gameObjectsManager.objects[bullet.belongsTo];
      }

      // Check if the target enemy is still alive
      if (
        this.targetEnemy &&
        !gameObjectsManager.objects[this.targetEnemy.id]
      ) {
        this.targetEnemy = undefined;
      }

      if (!this.targetEnemy || this.lookAroundInterval.ready) {
        this.lookAroundInterval.fireIfReady();
        const closestPlant = gameObjectsManager.findClosestObject(
          this,
          (oo) => {
            return oo.type === "plant_a";
          },
        ) as PlantA | null;

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

      if (
        this.targetPoint &&
        this.targetEnemy &&
        "collisionCircle" in this.targetEnemy &&
        "health" in this.targetEnemy
      ) {
        const distance = Math.sqrt(
          (this.x - this.targetPoint.x) ** 2 +
            (this.y - this.targetPoint.y) ** 2,
        );

        if (
          distance <=
          this.collisionCircle.radius +
            this.targetEnemy.collisionCircle.radius +
            this.attackRange
        ) {
          this.targetPoint = null;
          this.movement.stop();
          const te = this.targetEnemy;

          this.biteInterval.fireIfReady(() => {
            te.health.current -= this.attack;

            if (te.health.current <= 0) {
              this.numberOfPlantsEaten += 1;

              if (
                this.numberOfPlantsEaten >= 20 &&
                this.health.current >= this.health.max &&
                this.age <= MAX_REPRODUCTION_AGE
              ) {
                gameObjectsManager.spawnObject(
                  createPlantEaterA({ x: this.x, y: this.y }),
                );
                this.numberOfPlantsEaten = 0;
              }

              this.targetPoint = null;
            }
          });
        }
      }

      if (this.age < this.adultAge) {
        this.growthInterval.fireIfReady(() => {
          if (this.health.current >= this.health.max) {
            this.age += 1;
            this.health.max = this.age * BASE_HEALTH;
            this.health.current = this.health.max;
          }
        });
      }

      this.collisionCircle.radius = 5 + this.age;

      if ("circleRadius" in this.collision) {
        this.collision.circleRadius = this.collisionCircle.radius;
      }

      this.attack = BASE_ATTACK + (BASE_ATTACK * this.age) / this.adultAge;
      this.movement.maxSpeed =
        ((BASE_SPEED + (BASE_SPEED * this.age) / this.adultAge) *
          this.health.current) /
        this.health.max;
      this.attackRange = this.collisionCircle.radius / 2;

      if (this.age >= this.maxAge) {
        gameObjectsManager.despawnObject(this);
        gameObjectsManager.spawnObject(
          createShootingEnemyA({ x: this.x, y: this.y }),
        );
      }
    },
  };
}
