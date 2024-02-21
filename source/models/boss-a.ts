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
      bulletSpeed: 0.07,
      bulletStrength: 20,
      shotSound: "heavy shot",
    }),

    get targetPoint() {
      return targetPoint;
    },

    set targetPoint(p: Vector | null) {
      targetPoint = p;
    },

    update(delta: number, getState: () => State) {
      this.childrenSpawnInterval.update(delta, getState);
      this.movement.update(delta, getState, this);
      this.weapon.update(delta, getState, this);
      this.health.update(delta, getState, this);

      const { world } = getState();

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
      })();

      // Shoot stranger
      (() => {
        const { gameObjectsManager } = getState();

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
      this.childrenSpawnInterval.fireIfReady(() => {
        const { gameObjectsManager } = getState();

        gameObjectsManager.spawnObject(
          // Offset position slightly random
          createShootingEnemyA({
            x: this.x + Math.random() * 100 - 50,
            y: this.y + Math.random() * 100 - 50,
          }),
        );
      });
    },
  } as const;
};
