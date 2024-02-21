import { createEnemy } from "./enemy";
import { createEnemyC } from "./enemyC";
import { createItemRewardA } from "./item-reward-a";
import { createPlantEaterA } from "./plant-eater-a";
import { createShieldItem } from "./shield-item";
import { createWeaponAItem } from "./weapon-a-item";
import { createId } from "helpers";
import {
  type Identifiable,
  type Updatable,
  type Collidable,
  type Healthy,
  createObjectCollisionManager,
  createObjectHealthManager,
  type IntervalManager,
  createIntervalManager,
} from "services/state";

export interface PlantA extends Identifiable, Updatable, Collidable, Healthy {
  type: "plant_a";
  sproutInterval: IntervalManager;
  newGrowth: boolean;
  children: number;
}

const BASE_SPROUT_INTERVAL = 4000;

export function createPlantA(o: Partial<Pick<PlantA, "x" | "y">> = {}): PlantA {
  return {
    id: createId(),
    type: "plant_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 5 },
    health: createObjectHealthManager({
      maxHealth: 4,
      deathSound: null,
    }),
    collision: createObjectCollisionManager(),
    sproutInterval: createIntervalManager(BASE_SPROUT_INTERVAL, false),
    newGrowth: true,
    children: 0,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.sproutInterval.update(delta, getState);

      const MAX_NUMBER_OF_CHILDREN = 3;

      this.sproutInterval.fireIfReady(() => {
        this.sproutInterval.duration =
          BASE_SPROUT_INTERVAL + Math.random() * BASE_SPROUT_INTERVAL;

        if (!this.newGrowth) {
          this.health.current -= 0.05;

          return;
        }

        const { gameObjectsManager } = getState();

        const plantsWithinRange = getState().quadtree.query({
          x: this.x - this.collisionCircle.radius * 10,
          y: this.y - this.collisionCircle.radius * 10,
          width: this.collisionCircle.radius * 20,
          height: this.collisionCircle.radius * 20,
        });

        if (
          plantsWithinRange.length < 10 &&
          Object.keys(getState().gameObjectsManager.objects).length < 4000
        ) {
          const RADIUS = 25;
          const spawnLocation = {
            x:
              this.x +
              Math.random() * this.collisionCircle.radius * RADIUS -
              (this.collisionCircle.radius * RADIUS) / 2,
            y:
              this.y +
              Math.random() * this.collisionCircle.radius * RADIUS -
              (this.collisionCircle.radius * RADIUS) / 2,
          };

          let collides = false;

          // Check if spawnLocation is within the world
          if (
            spawnLocation.x < 0 ||
            spawnLocation.x > getState().world.size.x ||
            spawnLocation.y < 0 ||
            spawnLocation.y > getState().world.size.y
          ) {
            collides = true;
          }

          // Check if spawnLocation collides with any other objects

          if (!collides) {
            const collidesWith = this.collision.collidesWithObjects[0];

            collides = !!collidesWith;
          }

          if (!collides) {
            gameObjectsManager.spawnObject(createPlantA(spawnLocation));
            this.children += 1;

            if (this.children >= MAX_NUMBER_OF_CHILDREN) {
              this.newGrowth = false;
            }
          }
        } else {
          this.newGrowth = false;
        }
      });

      // After death
      if (this.health.current <= 0) {
        if (Math.random() < 0.003) {
          getState().gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.004) {
          getState().gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.05) {
          getState().gameObjectsManager.spawnObject(
            createEnemy({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.011) {
          getState().gameObjectsManager.spawnObject(
            createEnemyC({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.01) {
          createItemRewardA({ x: this.x, y: this.y });
        } else if (Math.random() < 0.005) {
          createPlantEaterA({ x: this.x, y: this.y });
        }
      }
    },
  };
}
