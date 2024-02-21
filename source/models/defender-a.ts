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
    targetPoint: null,
    shootingRange: 300,
    targetEnemyId: undefined,
    shield: createObjectShieldManager(),
    weapon: defaultWeapon,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.weapon.update(delta, getState, this);

      const { gameObjectsManager } = getState();

      // Defend StrangerA
      (() => {
        // Find closest stranger
        const closestStranger = getState().gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "stranger_a",
        );

        // Defend stranger
        (() => {
          if (closestStranger) {
            const distanceToStranger = Math.sqrt(
              (closestStranger.x - this.x) ** 2 +
                (closestStranger.y - this.y) ** 2,
            );

            if (distanceToStranger > this.shootingRange) {
              this.targetPoint = {
                x: closestStranger.x,
                y: closestStranger.y,
              };
              this.targetEnemyId = undefined;

              return;
            }

            if (!this.targetEnemyId) {
              this.targetPoint = null;
              this.movement.stop();
            }

            // If stranger hit by a bullet
            const enemyBullet =
              closestStranger.collision.collidesWithObjects.find(
                (o) => o.type === "bullet",
              ) as Bullet | undefined;

            if (enemyBullet && enemyBullet.belongsTo !== closestStranger.id) {
              this.targetEnemyId = enemyBullet.belongsTo;
            }
          }
        })();

        // Find better weapon
        (() => {
          if (this.targetPoint) {
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

          this.targetPoint = {
            x: weaponItem.x,
            y: weaponItem.y,
          };
        })();

        // Switch to default weapon when ammo is empty
        (() => {
          if (this.weapon.type === "machine_gun_b" && this.weapon.ammo <= 0) {
            this.weapon = defaultWeapon;
          }
        })();

        // Find shield
        (() => {
          if (this.targetPoint) {
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

          this.targetPoint = {
            x: shieldItem.x,
            y: shieldItem.y,
          };
        })();

        if (!this.targetEnemyId) {
          this.targetEnemyId = gameObjectsManager.findClosestObject(
            this,
            (oo) =>
              oo.type === "shooting_enemy_a" || oo.type === "shooting_enemy_b",
            this.shootingRange,
          )?.id;
        }

        const targetEnemy =
          this.targetEnemyId &&
          getState().gameObjectsManager.objects[this.targetEnemyId];

        if (!targetEnemy) {
          this.targetEnemyId = undefined;

          return;
        }

        const distanceToEnemy = vector.distance(this, targetEnemy);

        if (distanceToEnemy > this.shootingRange) {
          this.targetPoint = {
            x: targetEnemy.x,
            y: targetEnemy.y,
          };

          return;
        }

        this.targetPoint = null;
        this.movement.stop();

        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        // Adjust angle by enemy speed
        // TODO Fix this
        // if ("movement" in targetEnemy) {
        //   const adjustmentVector = vector.scale(
        //     targetEnemy.movement.speedVector,
        //     distanceToEnemy,
        //   );

        //   this.movement.angle = Math.atan2(
        //     targetEnemy.y - this.y + adjustmentVector.y,
        //     targetEnemy.x - this.x + adjustmentVector.x,
        //   );
        // }

        // Check if can shoot
        const shootingSegment: Matrix = [
          vector.create(this.x, this.y),
          vector.create(targetEnemy.x, targetEnemy.y),
        ];
        const willCollideWithFriendlyObject = !!getFirstObjectLineCollision(
          getState,
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
