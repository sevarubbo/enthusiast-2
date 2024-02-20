import { createBullet } from "./bullet";
import { createShieldItem } from "./shield-item";
import { createWeaponAItem } from "./weapon-a-item";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import {
  createObjectHealthManager,
  type Collidable,
  type Healthy,
  type IntervalManager,
  type Movable,
  createObjectMovementManager,
  createObjectCollisionManager,
  createIntervalManager,
} from "services/state";
import { vector } from "services/vector";

export interface ShootingEnemyA extends Movable, Collidable, Healthy {
  type: "shooting_enemy_a";
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
}

export function createShootingEnemyA(
  o: Partial<Pick<ShootingEnemyA, "x" | "y"> & { scale: number }> = {},
): ShootingEnemyA {
  const scale = Math.random() * 0.7 + 0.8;

  return {
    color: "#f00",
    id: createId(),
    type: "shooting_enemy_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: scale * 12 },
    health: createObjectHealthManager({
      maxHealth: 8 + scale * 8,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.05 / scale }),
    collision: createObjectCollisionManager(),
    targetPoint: null,
    shootingInterval: createIntervalManager(500 + scale * 500),
    shootingRange: 300 * scale,
    shield: createObjectShieldManager(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      const { gameObjectsManager } = getState();

      // Find targetEnemy
      const targetEnemy =
        gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "stranger_a" || oo.type === "shooting_enemy_b",
        ) ||
        gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "tower",
        ) ||
        gameObjectsManager.findClosestObject(
          this,
          (oo) =>
            oo.type === "plant_eater_a" ||
            oo.type === "enemyC" ||
            oo.type === "enemy",
        );

      if (targetEnemy) {
        // Get to shooting range

        const distance = Math.sqrt(
          (targetEnemy.x - this.x) ** 2 + (targetEnemy.y - this.y) ** 2,
        );

        // Aim at the stranger
        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        if (distance <= this.shootingRange) {
          const bulletPosition = vector.add(
            this,
            vector.scale(
              vector.fromAngle(this.movement.angle),
              this.collisionCircle.radius,
            ),
          );

          // Shoot
          this.shootingInterval.fireIfReady(() => {
            getState().gameObjectsManager.spawnObject(
              createBullet({
                ...bulletPosition,
                direction: vector.fromAngle(this.movement.angle),
                belongsTo: this.id,
                speed: 0.8,
              }),
            );

            playSound(
              "basic shot",
              getSoundPosition(this, getState().cameraManager),
            );
          });

          this.targetPoint = null;
          this.movement.stop();
        } else {
          this.targetPoint = {
            x: targetEnemy.x,
            y: targetEnemy.y,
          };
        }
      } else {
        this.targetPoint = null;
        this.movement.stop();
      }

      // After death
      if (this.health.current <= 0) {
        getState().statsManager.incrementEnemiesDied();

        // Check if the position is not too close to the player
        const stranger =
          getState().gameObjectsManager.findObjectsByType("stranger_a")[0];

        // Respawning
        (() => {
          if (!stranger) {
            return;
          }

          if (Math.random() < 0.99) {
            const randomPosition = getState().world.getRandomPoint();

            if (
              !(
                vector.distance(randomPosition, stranger) <
                this.shootingRange * 3
              ) ||
              getState().gameObjectsManager.findObjectsByType(
                "shooting_enemy_a",
              ).length < 0
            ) {
              getState().gameObjectsManager.spawnObject(
                createShootingEnemyA(randomPosition),
              );
            }
          }

          if (Math.random() < 0.6) {
            const randomPosition = getState().world.getRandomPoint();

            if (
              !(
                vector.distance(randomPosition, stranger) <
                this.shootingRange * 3
              )
            ) {
              getState().gameObjectsManager.spawnObject(
                createShootingEnemyA(randomPosition),
              );
            }
          }
        })();

        // Drop shield
        if (Math.random() < 0.1) {
          getState().gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.2) {
          // Drop weapon
          getState().gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
