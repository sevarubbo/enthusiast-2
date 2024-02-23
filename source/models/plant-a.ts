import { createDefenderA } from "./defender-a";
import { createEnemy } from "./enemy";
import { createEnemyC } from "./enemyC";
import { createItemRewardA } from "./item-reward-a";
import { createItemShotgun } from "./item-shotgun";
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
  /** @deprecated */
  collisionCircle: { radius: number };
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
    collision: createObjectCollisionManager({
      circleRadius: 5,
    }),
    sproutInterval: createIntervalManager(BASE_SPROUT_INTERVAL, false),
    newGrowth: true,
    children: 0,

    update(delta, state) {
      this.health.update(delta, state, this);
      this.sproutInterval.update(delta, state);

      const MAX_NUMBER_OF_CHILDREN = 3;

      this.sproutInterval.fireIfReady(() => {
        this.sproutInterval.duration =
          BASE_SPROUT_INTERVAL + Math.random() * BASE_SPROUT_INTERVAL;

        if (!this.newGrowth) {
          this.health.current -= 0.05;

          return;
        }

        const { gameObjectsManager } = state;

        const plantsWithinRange = state.quadtree.query({
          x: this.x - this.collisionCircle.radius * 10,
          y: this.y - this.collisionCircle.radius * 10,
          width: this.collisionCircle.radius * 20,
          height: this.collisionCircle.radius * 20,
        });

        if (
          plantsWithinRange.length < 10 &&
          Object.keys(state.gameObjectsManager.objects).length < 4000
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
            spawnLocation.x > state.world.size.x ||
            spawnLocation.y < 0 ||
            spawnLocation.y > state.world.size.y
          ) {
            collides = true;
          }

          // Check if spawnLocation collides with any other solid objects

          if (!collides) {
            const collidesWith = this.collision.collidesWithObjects[0];

            collides = !!collidesWith?.collision.isSolid;
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
          state.gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.004) {
          state.gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.002) {
          state.gameObjectsManager.spawnObject(
            createItemShotgun({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.02) {
          state.gameObjectsManager.spawnObject(
            createEnemy({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.009) {
          state.gameObjectsManager.spawnObject(
            createEnemyC({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.01) {
          createItemRewardA({ x: this.x, y: this.y });
        } else if (Math.random() < 0.005) {
          createPlantEaterA({ x: this.x, y: this.y });
        } else if (Math.random() < 0.1) {
          createDefenderA({ x: this.x, y: this.y });
        }
      }
    },
  };
}
