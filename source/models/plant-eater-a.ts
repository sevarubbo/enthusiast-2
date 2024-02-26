import { createBloodWhenHitByBullet } from "./blood-particle";
import { createBloodStain } from "./blood-stain";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { matrix } from "services/matrix";
import {
  createObjectCollisionManager,
  type Healthy,
  type Identifiable,
  type Updatable,
  createObjectHealthManager,
  createObjectMovementManager,
  createIntervalManager,
} from "services/state";
import { vector } from "services/vector";
import type { Bullet } from "./bullet";
import type { PlantA } from "./plant-a";
import type { CollidableCircle2, Movable } from "services/state";
import type { StateObject } from "types";

export interface PlantEaterA
  extends Identifiable,
    Updatable,
    CollidableCircle2,
    Healthy,
    Movable {
  type: "plant_eater_a";
  energy: number;
  color: string;
  targetEnemy: StateObject | undefined;
  attack: number;
  lookAroundInterval: ReturnType<typeof createIntervalManager>;
  shield: ReturnType<typeof createObjectShieldManager>;
  growthInterval: ReturnType<typeof createIntervalManager>;
  biteInterval: ReturnType<typeof createIntervalManager>;
  age: number;
  attackRange: number;
  maxAge: number;
  size: number;
}

const BASE_ATTACK = 2;
const BASE_SPEED = 0.002;
const MAX_AGE = 10;
const MAX_REPRODUCTION_AGE = MAX_AGE * 0.8;
const BASE_HEALTH = 4;
const AGE_SPEED = 0.00005;
const REPRODUCTION_ENERGY = 28;
const ENERGY_FROM_PLANT = 0.12;

export function createPlantEaterA(
  o: Partial<Pick<PlantEaterA, "x" | "y">> = {},
): PlantEaterA {
  return {
    color: "#a00",
    id: createId(),
    type: "plant_eater_a",
    x: o.x || 0,
    y: o.y || 0,
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
    energy: 0,
    targetEnemy: undefined,
    attack: 100,
    lookAroundInterval: createIntervalManager(10000),
    growthInterval: createIntervalManager(10000),
    biteInterval: createIntervalManager(500),
    age: 1,
    maxAge: MAX_AGE,
    shield: createObjectShieldManager(),
    attackRange: 0,

    get size() {
      return Math.min(this.age, MAX_REPRODUCTION_AGE);
    },

    update(delta, state) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.lookAroundInterval.update(delta);
      this.growthInterval.update(delta);
      this.biteInterval.update(delta);

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
        this.lookAroundInterval.fireIfReady(() => undefined);
        const closestPlant = gameObjectsManager.findClosestObject(
          this,
          (oo) => {
            return oo.type === "plant_a";
          },
        ) as PlantA | null;

        this.targetEnemy = closestPlant || undefined;
      }

      if (this.targetEnemy) {
        this.movement.setTargetPoint({
          x: this.targetEnemy.x,
          y: this.targetEnemy.y,
        });
      } else if (!this.movement.targetPoint) {
        const size = this.collision.circleRadius;
        const RANGE = size * 10;

        const randomPoint = {
          x: this.x + Math.random() * RANGE * 2 - RANGE,
          y: this.y + Math.random() * RANGE * 2 - RANGE,
        };

        this.movement.setTargetPoint(
          matrix.fitPoint(
            randomPoint,
            matrix.create(
              size,
              size,
              state.world.size.x - size,
              state.world.size.y - size,
            ),
          ),
        );
      }

      if (
        this.movement.targetPoint &&
        this.targetEnemy &&
        "health" in this.targetEnemy
      ) {
        const distanceSquared = vector.distanceSquared(this, this.targetEnemy);

        const teCollisionCircleRadius =
          "collisionCircle" in this.targetEnemy
            ? this.targetEnemy.collisionCircle.radius
            : this.targetEnemy.collision.circleRadius;

        if (
          distanceSquared <=
          (this.collision.circleRadius +
            teCollisionCircleRadius +
            this.attackRange) **
            2
        ) {
          this.movement.setTargetPoint(null);
          const te = this.targetEnemy;

          this.biteInterval.fireIfReady(() => {
            te.health.decrease(this.attack, te, state);

            const energy = this.attack * ENERGY_FROM_PLANT;

            this.energy += energy;

            this.health.increase(energy);

            if (
              this.energy >= REPRODUCTION_ENERGY &&
              this.health.current >= this.health.max &&
              this.age <= MAX_REPRODUCTION_AGE
            ) {
              gameObjectsManager.spawnObject(
                createPlantEaterA({ x: this.x, y: this.y }),
              );
              this.energy = 0;
            }

            this.movement.setTargetPoint(null);
          });
        }
      }

      if (this.age <= MAX_REPRODUCTION_AGE) {
        this.growthInterval.fireIfReady(() => {
          if (this.health.current >= this.health.max) {
            this.health.max = this.size * BASE_HEALTH;
            this.health.increase(this.health.max - this.health.current);
          }
        });
      }

      this.collision.circleRadius = 5 + this.size;

      this.attack =
        BASE_ATTACK + (BASE_ATTACK * this.size) / MAX_REPRODUCTION_AGE;
      this.movement.maxSpeed =
        ((BASE_SPEED + (BASE_SPEED * this.size) / MAX_REPRODUCTION_AGE) *
          this.health.current) /
        this.health.max;
      this.attackRange = this.collision.circleRadius / 2;

      if (this.age >= this.maxAge) {
        gameObjectsManager.despawnObject(this);
      } else {
        this.age += delta * AGE_SPEED;
      }

      createBloodWhenHitByBullet(this, state);

      // After death
      this.health.afterDeath(() => {
        state.gameObjectsManager.spawnObject(
          createBloodStain({ x: this.x, y: this.y }),
        );
      });
    },
  };
}
