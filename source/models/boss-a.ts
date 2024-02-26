import { createBaseObject, createExplosion } from "./helpers";
import { createShootingEnemyA } from "./shooting-enemy-a";
import { createWeaponA } from "./weapon-a";
import { createWeaponBElement } from "./weapon-b-element";
import { getSoundProperties, playSound } from "../services/audio";
import { matrix } from "services/matrix";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
  type State,
} from "services/state";
import { createShield } from "services/state/objectShieldManager";
import { vector, type Vector } from "services/vector";

const SPAWN_INTERVAL = 1000;
const WAVE_INTERVAL = 30000;
const MIN_SPAWN_NUMBER = 1;
const MAX_SPAWN_NUMBER = 10;
const SPAWN_DISTANCE = 100;

export const createBossA = (position: Vector) => {
  let targetPoint: Vector | null = null;

  let testWeapon: object | null = null;

  let childrenLeftToSpawn =
    Math.random() * (MAX_SPAWN_NUMBER - MIN_SPAWN_NUMBER) + MIN_SPAWN_NUMBER;

  return {
    ...createBaseObject(position),
    type: "boss_a",
    color: "#000",

    collision: createObjectCollisionManager({
      circleRadius: 90,
    }),

    health: createObjectHealthManager({
      maxHealth: 1000,
      // maxHealth: 100,
      selfHealing: true,
    }),
    childrenSpawnInterval: createIntervalManager(SPAWN_INTERVAL, false),
    childrenSpawnWaveInterval: createIntervalManager(WAVE_INTERVAL, false),

    movement: createObjectMovementManager({ maxSpeed: 0.01 }),

    fireRange: 600,

    weapon: createWeaponA({
      bulletSize: 5,
      bulletSpeed: 0.09,
      bulletStrength: 50,
      shotSound: "heavy shot",
      fireRate: 1.1,
      autoRefillRate: 2,
    }),

    shield: createShield({
      active: true,
      // maxHp: 100,
      maxHp: 1000,
      shieldHitSound: "boss shield hit",
      shieldLostSound: "boss shield lost",
    }),

    get targetPoint() {
      return targetPoint;
    },

    set targetPoint(p: Vector | null) {
      targetPoint = p;
    },

    update(delta: number, state: State) {
      this.childrenSpawnInterval.update(delta);
      this.movement.update(delta, state, this);
      this.weapon.update(delta, state, this);
      this.health.update(delta, state, this);

      if (!testWeapon) {
        testWeapon = {};

        state.gameObjectsManager.spawnObject(createWeaponBElement(this));
      }

      const { world } = state;

      // Move to random points
      (() => {
        if (this.targetPoint) {
          return;
        }

        const RANDOM_POINT_OFFSET = this.collision.circleRadius * 2;

        const worldBox = matrix.create(0, 0, world.size.x, world.size.y);

        targetPoint = matrix.fitPoint(
          {
            x:
              this.x -
              RANDOM_POINT_OFFSET +
              2 * RANDOM_POINT_OFFSET * Math.random(),
            y:
              this.y -
              RANDOM_POINT_OFFSET +
              2 * RANDOM_POINT_OFFSET * Math.random(),
          },
          worldBox,
        );

        // try to get closer to center
        const center = vector.scale(world.size, 0.5);

        targetPoint = vector.add(
          targetPoint,
          vector.scale(vector.subtract(center, targetPoint), 0.1),
        );
      })();

      const { gameObjectsManager } = state;

      // Shoot stranger
      (() => {
        const targetEnemy = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "stranger_a" || oo.type === "tower",
        );

        if (!targetEnemy) {
          return;
        }

        const distanceSquared = vector.distanceSquared(this, targetEnemy);

        if (distanceSquared > this.fireRange ** 2) return;

        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        this.weapon.fireAtAngle(this.movement.angle);
      })();

      // Spawn children
      // (() => {
      //   const stranger = gameObjectsManager.findClosestObject(
      //     this,
      //     (oo) => oo.type === "stranger_a",
      //   );
      //
      //   if (!stranger) return;
      //
      //   const distanceToStrangerSquared = vector.distanceSquared(
      //     this,
      //     stranger,
      //   );
      //
      //   if (distanceToStrangerSquared > this.fireRange ** 3) return;
      //
      //   this.childrenSpawnInterval.fireIfReady(() => {
      //     let numberOfChildren = 1;
      //
      //     if (Math.random() < 0.5) {
      //       numberOfChildren = 2;
      //     } else if (Math.random() < 0.2) {
      //       numberOfChildren = 3;
      //     } else if (Math.random() < 0.1) {
      //       numberOfChildren = 5;
      //     }
      //
      //     for (let i = 0; i < numberOfChildren; i++)
      //       gameObjectsManager.spawnObject(
      //         // Offset position slightly random
      //         createShootingEnemyA({
      //           x: this.x + Math.random() * 100 - 50,
      //           y: this.y + Math.random() * 100 - 50,
      //         }),
      //       );
      //   });
      // })();

      // Spawn children in waves
      (() => {
        this.childrenSpawnWaveInterval.update(delta);

        this.childrenSpawnWaveInterval.fireIfReady(() => {
          const stranger = gameObjectsManager.findClosestObject(
            this,
            (oo) => oo.type === "stranger_a",
          );

          if (!stranger) return;

          childrenLeftToSpawn =
            Math.random() * (MAX_SPAWN_NUMBER - MIN_SPAWN_NUMBER) +
            MIN_SPAWN_NUMBER;
        });

        if (childrenLeftToSpawn <= 0) return;
        this.childrenSpawnInterval.fireIfReady(() => {
          // Offset position from center using SPAWN_DISTANCE
          const spawnLocation = {
            x: this.x + Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE,
            y: this.y + Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE,
          };

          gameObjectsManager.spawnObject(createShootingEnemyA(spawnLocation));
          childrenLeftToSpawn--;
        });
      })();

      // Shield
      (() => {
        this.shield.onShieldLost(() => {
          createExplosion(this, state, 100, 0.1);
        });
      })();

      // After death
      (() => {
        if (this.health.current <= 0) {
          // Create massive explosion
          createExplosion(this, state, 1000, 0.3);

          state.statsManager.bossDied = true;

          playSound(
            "boss death",
            getSoundProperties(this, state.cameraManager),
          );
        }
      })();
    },
  } as const;
};
