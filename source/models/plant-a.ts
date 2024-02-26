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

export type PlantA = ReturnType<typeof createPlantA>;
const MIN_SIZE = 1;
const MAX_SIZE = 5;
const GROWTH_SPEED = 0.007;
const BASE_SPROUT_INTERVAL = 16 / GROWTH_SPEED;
const DECAY_SPEED = GROWTH_SPEED / 90;
const BASE_HEALTH = 10;
const BASE_MAX_AGE = 700;
const MAX_PLANTS = 2700;

export function createPlantA(position: Vector) {
  let age = 0;
  const maxAge = (Math.random() * BASE_MAX_AGE) / 2 + BASE_MAX_AGE / 2;
  const minSproutAge = maxAge * 0.2;

  return {
    ...createBaseObject(position),
    type: "plant_a",
    health: createObjectHealthManager({
      maxHealth: BASE_HEALTH + Math.random() * BASE_HEALTH,
      deathSound: null,
    }),
    collision: createObjectCollisionManager({
      circleRadius: 1,
    }),
    sproutInterval: createIntervalManager(BASE_SPROUT_INTERVAL, false),

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      this.sproutInterval.update(delta);

      this.collision.circleRadius =
        MIN_SIZE + (age / maxAge) * (MAX_SIZE - MIN_SIZE);

      if (age < maxAge) {
        age += delta * GROWTH_SPEED;
      } else {
        this.health.decrease(delta * DECAY_SPEED, this, state);
      }

      (() => {
        this.sproutInterval.fireIfReady(() => {
          if (age >= maxAge * 0.8) return;

          if (age < minSproutAge) return;

          if (Math.random() < 0.5) return;

          this.sproutInterval.duration =
            BASE_SPROUT_INTERVAL + Math.random() * BASE_SPROUT_INTERVAL;

          const { gameObjectsManager } = state;

          if (
            gameObjectsManager.findObjectsByType("plant_a").length >= MAX_PLANTS
          )
            return;

          const SPAWN_DISTANCE = 100;

          const minDistance = this.collision.circleRadius * 2;
          const [xOffset, yOffset] = [
            gaussianRandom(10) * this.collision.circleRadius * SPAWN_DISTANCE,
            gaussianRandom(10) * this.collision.circleRadius * SPAWN_DISTANCE,
          ];

          const spawnLocation = {
            x: this.x + xOffset + (xOffset > 0 ? minDistance : -minDistance),
            y: this.y + yOffset + (yOffset > 0 ? minDistance : -minDistance),
          };

          const nearbySolidObjects = state.quadtree
            .queryRadius(spawnLocation, this.collision.circleRadius * 10)
            .filter((o) => "collision" in o && o.collision.isSolid);

          if (nearbySolidObjects.length > 2) return;

          // Check if spawnLocation is within the world
          if (
            spawnLocation.x < 0 ||
            spawnLocation.x > state.world.size.x ||
            spawnLocation.y < 0 ||
            spawnLocation.y > state.world.size.y
          ) {
            return;
          }

          gameObjectsManager.spawnObject(createPlantA(spawnLocation));
        });
      })();

      // After death
      if (this.health.current <= 0) {
        if (Math.random() < 0.003) {
          state.gameObjectsManager.spawnObject(
            createPlantA({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.004) {
          state.gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.0032) {
          state.gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.002) {
          state.gameObjectsManager.spawnObject(
            createItemShotgun({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.017) {
          state.gameObjectsManager.spawnObject(
            createEnemy({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.007) {
          state.gameObjectsManager.spawnObject(
            createEnemyC({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.01) {
          createItemRewardA({ x: this.x, y: this.y });
        } else if (Math.random() < 0.0099) {
          createPlantEaterA({ x: this.x, y: this.y });
        } else if (Math.random() < 0.14) {
          createDefenderA({ x: this.x, y: this.y });
        }
      }
    },
  } as const;
}

// Gaussian random. Takes a number and returns a number between -n and n
function gaussianRandom(n: number) {
  let r = 0;

  for (let i = 0; i < n; i++) {
    r += Math.random();
  }

  return r / n - 0.5;
}
