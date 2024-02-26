import { createBullet } from "./bullet";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import {
  createObjectHealthManager,
  type Healthy,
  type IntervalManager,
  type Movable,
  createObjectMovementManager,
  createObjectCollisionManager,
  createIntervalManager,
} from "services/state";
import { vector } from "services/vector";
import type { CollidableCircle } from "services/state";

export interface EnemyD extends Movable, CollidableCircle, Healthy {
  type: "shooting_enemy_b";
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
}

const BASE_HEALTH = 4;
const BASE_SPEED = 0.009;

export function createEnemyD(
  o: Partial<Pick<EnemyD, "x" | "y"> & { scale: number }> = {},
): EnemyD {
  const scale = 0.05;

  return {
    color: "#8c8c8c",
    id: createId(),
    type: "shooting_enemy_b",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: scale * 110 },
    health: createObjectHealthManager({
      maxHealth: BASE_HEALTH + scale * BASE_HEALTH,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: BASE_SPEED / scale }),
    collision: createObjectCollisionManager({
      circleRadius: scale * 110,
    }),
    targetPoint: null,
    shootingInterval: createIntervalManager(400 + scale * 400),
    shootingRange: 700 * scale,
    shield: createObjectShieldManager(),

    update(delta, state) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.shootingInterval.update(delta);

      let targetEnemy = state.gameObjectsManager.findClosestObject(
        {
          x: this.x,
          y: this.y,
        },
        (oo) =>
          oo.type === "stranger_a" ||
          oo.type === "shooting_enemy_a" ||
          oo.type === "enemyC" ||
          oo.type === "enemy" ||
          oo.type === "tower",
      );

      targetEnemy = targetEnemy === this ? null : targetEnemy;

      if (!targetEnemy) {
        this.targetPoint = null;
        this.movement.stop();
      } else {
        // Get to shooting range
        const distance =
          Math.sqrt(
            (targetEnemy.x - this.x) ** 2 + (targetEnemy.y - this.y) ** 2,
          ) -
          ("collisionCircle" in targetEnemy
            ? targetEnemy.collisionCircle.radius
            : 0);

        // Aim at the stranger
        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        if (distance <= this.shootingRange) {
          this.targetPoint = null;
          this.movement.stop();

          const bulletPosition = vector.add(
            this,
            vector.scale(
              vector.fromAngle(this.movement.angle),
              this.collisionCircle.radius,
            ),
          );

          // Shoot
          this.shootingInterval.fireIfReady(() => {
            state.gameObjectsManager.spawnObject(
              createBullet({
                ...bulletPosition,
                direction: vector.fromAngle(this.movement.angle),
                belongsTo: this.id,
              }),
            );

            playSound(
              "basic shot",
              getSoundPosition(this, state.cameraManager),
            );
          });
        } else {
          this.targetPoint = {
            x: targetEnemy.x,
            y: targetEnemy.y,
          };
        }
      }

      // After death
      if (this.health.current <= 0) {
        //
      }
    },
  };
}
