import { createDefenderA } from "./defender-a";
import { createEnemy } from "./enemy";
import { createEnemyC } from "./enemyC";
import { createBaseObject } from "./helpers";
import { createItemRewardA } from "./item-reward-a";
import { createItemShotgun } from "./item-shotgun";
import { createPlantEaterA } from "./plant-eater-a";
import { createShieldItem } from "./shield-item";
import { createWeaponAItem } from "./weapon-a-item";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
  createIntervalManager,
} from "services/state";
import type { Vector } from "../services/vector";
import type { State } from "services/state";

const BASE_SPROUT_INTERVAL = 4000;

export type PlantA = ReturnType<typeof createPlantA>;
const MIN_SIZE = 1;
const MAX_SIZE = 5;
const GROWTH_SPEED = 0.01;

export function createPlantA(position: Vector) {
  let age = 0;
  const maxAge = 1000;

  return {
    ...createBaseObject(position),
    type: "plant_a",
    health: createObjectHealthManager({
      maxHealth: 4,
      deathSound: null,
    }),
    collision: createObjectCollisionManager({
      circleRadius: 1,
    }),
    sproutInterval: createIntervalManager(BASE_SPROUT_INTERVAL, false),
    newGrowth: true,

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      this.sproutInterval.update(delta, state);

      this.collision.circleRadius =
        MIN_SIZE + (age / maxAge) * (MAX_SIZE - MIN_SIZE);

      if (age < maxAge) {
        age += delta * GROWTH_SPEED;
      } else {
        this.health.decrease((delta * GROWTH_SPEED) / 500, this, state);
      }

      this.sproutInterval.fireIfReady(() => {
        if (age >= maxAge * 0.8) return;

        this.sproutInterval.duration =
          BASE_SPROUT_INTERVAL + Math.random() * BASE_SPROUT_INTERVAL;

        const { gameObjectsManager } = state;

        const plantsWithinRange = state.quadtree.query({
          x: this.x - this.collision.circleRadius * 10,
          y: this.y - this.collision.circleRadius * 10,
          width: this.collision.circleRadius * 20,
          height: this.collision.circleRadius * 20,
        });

        if (
          plantsWithinRange.length < 10 &&
          Object.keys(state.gameObjectsManager.objects).length < 4000
        ) {
          const SPAWN_DISTANCE = 34;
          const spawnLocation = {
            x:
              this.x +
              Math.random() * this.collision.circleRadius * SPAWN_DISTANCE -
              (this.collision.circleRadius * SPAWN_DISTANCE) / 2,
            y:
              this.y +
              Math.random() * this.collision.circleRadius * SPAWN_DISTANCE -
              (this.collision.circleRadius * SPAWN_DISTANCE) / 2,
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
          }
        }
      });

      // After death
      if (this.health.current <= 0) {
        if (Math.random() < 0.0037) {
          state.gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.0035) {
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
        } else if (Math.random() < 0.12) {
          createDefenderA({ x: this.x, y: this.y });
        }
      }
    },
  } as const;
}
