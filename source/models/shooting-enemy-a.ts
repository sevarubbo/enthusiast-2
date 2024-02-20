import { createShieldItem } from "./shield-item";
import { createWeaponA } from "./weapon-a";
import { createWeaponAItem } from "./weapon-a-item";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Collidable,
  type Healthy,
  type Movable,
  createObjectMovementManager,
  createObjectCollisionManager,
} from "services/state";
import { vector } from "services/vector";
import type { Weapon } from "services/state";

export interface ShootingEnemyA extends Movable, Collidable, Healthy {
  type: "shooting_enemy_a";
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
  weapon: Weapon;
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
    shootingRange: 300 * scale,
    shield: createObjectShieldManager(),
    weapon: createWeaponA(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.weapon.update(delta, getState, this);

      const { gameObjectsManager } = getState();

      // Find targetEnemy
      const targetEnemy =
        gameObjectsManager.findClosestObject(
          this,
          (oo) =>
            oo.type === "stranger_a" ||
            oo.type === "shooting_enemy_b" ||
            oo.type === "defender_a",
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
          this.targetPoint = null;
          this.movement.stop();

          // Shoot
          this.weapon.fireAtAngle(this.movement.angle);
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

          if (Math.random() < 0.7) {
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
        } else if (Math.random() < 0.18) {
          // Drop weapon
          getState().gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
