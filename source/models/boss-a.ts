import { createExplosion } from "./helpers";
import { createShootingEnemyA } from "./shooting-enemy-a";
import { createWeaponA } from "./weapon-a";
import { createId } from "helpers";
import { matrix } from "services/matrix";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
  type State,
} from "services/state";
import { createObjectShieldManager } from "services/state/objectShieldManager";
import { vector, type Vector } from "services/vector";

const createBaseObject = (position: Vector) => ({
  id: createId(),

  get x() {
    return position.x;
  },

  get y() {
    return position.y;
  },

  setPosition(p: Vector) {
    position.x = p.x;
    position.y = p.y;
  },
});

export const createBossA = (position: Vector) => {
  let targetPoint: Vector | null = null;

  return {
    ...createBaseObject(position),
    type: "boss_a",
    color: "#000",

    collisionCircle: { radius: 50 },
    collision: createObjectCollisionManager(),
    health: createObjectHealthManager({ maxHealth: 1000, selfHealing: true }),
    childrenSpawnInterval: createIntervalManager(10000, false),
    movement: createObjectMovementManager({ maxSpeed: 0.01 }),

    fireRange: 600,

    weapon: createWeaponA({
      bulletSize: 4,
      bulletSpeed: 0.08,
      bulletStrength: 40,
      shotSound: "heavy shot",
    }),

    shield: createObjectShieldManager({ active: true, maxHp: 1000 }),

    get targetPoint() {
      return targetPoint;
    },

    set targetPoint(p: Vector | null) {
      targetPoint = p;
    },

    update(delta: number, state: State) {
      this.childrenSpawnInterval.update(delta, state);
      this.movement.update(delta, state, this);
      this.weapon.update(delta, state, this);
      this.health.update(delta, state, this);

      const { world } = state;

      // Move to random points
      (() => {
        if (this.targetPoint) {
          return;
        }

        const RANDOM_POINT_OFFSET = this.collisionCircle.radius * 2;

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
          (oo) => oo.type === "stranger_a",
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
      (() => {
        const stranger = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "stranger_a",
        );

        if (!stranger) return;

        const distanceToStrangerSquared = vector.distanceSquared(
          this,
          stranger,
        );

        if (distanceToStrangerSquared > this.fireRange ** 3) return;

        if (this.health.current < this.health.max) return;

        this.childrenSpawnInterval.fireIfReady(() => {
          gameObjectsManager.spawnObject(
            // Offset position slightly random
            createShootingEnemyA({
              x: this.x + Math.random() * 100 - 50,
              y: this.y + Math.random() * 100 - 50,
            }),
          );
        });
      })();

      // After death
      (() => {
        if (this.health.current <= 0) {
          // Create massive explosion
          createExplosion(this, state, 1000);

          state.statsManager.bossDied = true;
        }
      })();
    },
  } as const;
};
