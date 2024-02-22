import { type Bullet } from "./bullet";
import { createMachineGun } from "./weapon-a";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
  type Collidable,
  type Healthy,
  type Movable,
} from "services/state";
import { getFirstObjectLineCollision } from "services/state/helpers";
import { vector } from "services/vector";
import type { Matrix } from "services/matrix";
import type { Weapon } from "services/state";

export interface DefenderA extends Movable, Collidable, Healthy {
  type: "defender_a";
  shootingRange: number;
  color: string;
  targetEnemyId: string | undefined;
  shield: ReturnType<typeof createObjectShieldManager>;
  weapon: Weapon;
}

const defaultWeapon = createMachineGun();

export function createDefenderA(
  options: Partial<Pick<DefenderA, "x" | "y">> = {},
): DefenderA {
  return {
    color: "#a50",
    id: createId(),
    type: "defender_a",
    x: options.x || 0,
    y: options.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 20,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.08 }),
    collision: createObjectCollisionManager(),
    shootingRange: 300,
    targetEnemyId: undefined,
    shield: createObjectShieldManager(),
    weapon: defaultWeapon,

    update(delta, state) {
      this.health.update(delta, state, this);
      this.collision.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.collision.update(delta, state, this);
      this.weapon.update(delta, state, this);

      const { gameObjectsManager } = state;

      // Find closest stranger
      const closestStranger = state.gameObjectsManager.findClosestObject(
        this,
        (oo) => oo.type === "stranger_a",
      );

      let idle = true;

      // Defend stranger
      idle = (() => {
        if (!closestStranger) {
          this.movement.setTargetPoint(null);

          return true;
        }

        const distanceToStranger = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        if (distanceToStranger > this.shootingRange) {
          // Forget about enemy
          this.targetEnemyId = undefined;

          // Go to stranger
          this.movement.setTargetPoint(closestStranger);
        } else {
          this.movement.setTargetPoint(null);

          return true;
        }

        // If stranger hit by a bullet
        const enemyBullet = closestStranger.collision.collidesWithObjects.find(
          (o) => o.type === "bullet",
        ) as Bullet | undefined;

        if (enemyBullet && enemyBullet.belongsTo !== closestStranger.id) {
          this.targetEnemyId = enemyBullet.belongsTo;
        }

        return false;
      })();

      // Find better weapon
      (() => {
        if (!idle) {
          return;
        }

        if (this.weapon.type === "machine_gun_b" && this.weapon.ammo > 0) {
          return;
        }

        const weaponItem = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "weapon_a_item",
        );

        if (!weaponItem) {
          return;
        }

        // Don't go too far for a weapon
        if (
          closestStranger &&
          vector.distance(closestStranger, weaponItem) > this.shootingRange
        ) {
          return;
        }

        this.movement.setTargetPoint(weaponItem);
      })();

      // Switch to default weapon when ammo is empty
      (() => {
        if (this.weapon.type === "machine_gun_b" && this.weapon.ammo <= 0) {
          this.weapon = defaultWeapon;
        }
      })();

      // Find shield
      (() => {
        if (this.movement.targetPoint) {
          return;
        }

        if (this.shield.active && this.shield.hp > 0) {
          return;
        }

        const shieldItem = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "shield_item",
        );

        if (!shieldItem) {
          return;
        }

        // Don't go too far for a shield
        if (
          closestStranger &&
          vector.distance(closestStranger, shieldItem) > this.shootingRange
        ) {
          return;
        }

        this.movement.setTargetPoint(shieldItem);
      })();

      if (!this.targetEnemyId && !this.targetPoint) {
        // Defend self
        (() => {
          const enemyBullet = this.collision.collidesWithObjects.find(
            (o) => o.type === "bullet",
          ) as Bullet | undefined;

          const targetEnemy =
            enemyBullet && gameObjectsManager.objects[enemyBullet.belongsTo];

          if (targetEnemy) {
            // Don't go too far for an enemy
            if (
              closestStranger &&
              vector.distance(closestStranger, targetEnemy) < this.shootingRange
            ) {
              this.targetEnemyId = targetEnemy.id;
            } else {
              this.targetEnemyId = undefined;
            }
          }
        })();

        if (!this.targetEnemyId) {
          this.targetEnemyId = gameObjectsManager.findClosestObject(
            this,
            (oo) =>
              oo.type === "shooting_enemy_a" ||
              oo.type === "shooting_enemy_b" ||
              oo.type === "boss_a",
            this.shootingRange,
          )?.id;
        }
      }

      // Attack enemies in range
      (() => {
        const targetEnemy =
          this.targetEnemyId &&
          state.gameObjectsManager.objects[this.targetEnemyId];

        if (!targetEnemy) {
          this.targetEnemyId = undefined;

          return;
        }

        const distanceToEnemy = vector.distance(this, targetEnemy);

        if (distanceToEnemy > this.shootingRange) {
          this.movement.setTargetPoint(targetEnemy);

          return;
        }

        this.movement.setTargetPoint(null);

        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        // Check if can shoot
        const shootingSegment: Matrix = [
          vector.create(this.x, this.y),
          vector.create(targetEnemy.x, targetEnemy.y),
        ];
        const willCollideWithFriendlyObject = !!getFirstObjectLineCollision(
          state,
          shootingSegment,
          (object) => {
            if (object === this) {
              return false;
            }

            return object.type === "defender_a" || object.type === "stranger_a";
          },
        );

        if (!willCollideWithFriendlyObject) {
          if (this.weapon.ammo > 0) {
            this.weapon.fireAtAngle(this.movement.angle);
          }
        }
      })();
    },
  };
}
