import { createBloodStain } from "./blood-stain";
import { type Bullet } from "./bullet";
import { createBaseObject } from "./helpers";
import { createDefaultGun } from "./weapon-a";
import { createShield } from "../services/state/objectShieldManager";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import { getFirstObjectLineCollision } from "services/state/helpers";
import { vector } from "services/vector";
import type { StrangerA } from "./stranger-a";
import type { Matrix } from "services/matrix";
import type { Weapon, State } from "services/state";
import type { Vector } from "services/vector";

export type DefenderA = ReturnType<typeof createDefenderA>;

const defaultWeapon = createDefaultGun();

export function createDefenderA(position: Vector) {
  let targetEnemyId = undefined as string | undefined;
  let weapon = defaultWeapon as Weapon;

  return {
    ...createBaseObject(position),
    color: "#a50",
    type: "defender_a",
    health: createObjectHealthManager({
      maxHealth: 20,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.08 }),
    collision: createObjectCollisionManager({
      circleRadius: 12,
    }),
    shootingRange: 300,
    shield: createShield(),

    looseFocusInterval: createIntervalManager(5000),

    get weapon() {
      return weapon;
    },

    setWeapon(value: Weapon) {
      weapon = value;
    },

    update(delta: number, state: State) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      weapon.update(delta, state, this);
      this.looseFocusInterval.update(delta);

      const { gameObjectsManager } = state;

      this.looseFocusInterval.fireIfReady(() => {
        targetEnemyId = undefined;
      });

      // Find the closest stranger
      const closestStranger =
        state.gameObjectsManager.findClosestObjectByType<StrangerA>(
          this,
          "stranger_a",
        );

      let idle = true;

      // Defend stranger
      idle = (() => {
        if (targetEnemyId) {
          return true;
        }

        if (!closestStranger) {
          this.movement.setTargetPoint(null);

          return true;
        }

        const distanceToStranger = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        if (distanceToStranger > this.shootingRange) {
          // Forget about enemy
          targetEnemyId = undefined;

          // Go to stranger
          this.movement.setTargetPoint(closestStranger);

          return false;
        }

        this.movement.setTargetPoint(null);

        // If stranger hit by a bullet
        const enemyBullet = closestStranger.collision.collidesWithObjects.find(
          (o) => o.type === "bullet",
        ) as Bullet | undefined;

        if (enemyBullet && enemyBullet.belongsTo !== closestStranger.id) {
          targetEnemyId = enemyBullet.belongsTo;

          return true;
        }

        return true;
      })();

      // Find better weapon
      (() => {
        if (!idle) {
          return;
        }

        if (weapon.type === "machine_gun_b" && weapon.ammo > 0) {
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
        if (weapon.type === "machine_gun_b" && weapon.ammo <= 0) {
          weapon = defaultWeapon;
        }
      })();

      // Find shield
      (() => {
        if (!idle) {
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

      if (idle) {
        // Defend self
        (() => {
          const enemyBullet = this.collision.collidesWithObjects.find(
            (o) => o.type === "bullet" && o.belongsTo !== this.id,
          ) as Bullet | undefined;

          const targetEnemy =
            enemyBullet && gameObjectsManager.objects[enemyBullet.belongsTo];

          if (targetEnemy) {
            // Don't go too far for an enemy
            if (
              closestStranger &&
              vector.distance(closestStranger, targetEnemy) < this.shootingRange
            ) {
              targetEnemyId = targetEnemy.id;
            } else {
              targetEnemyId = undefined;
            }
          }
        })();

        if (!targetEnemyId) {
          targetEnemyId = gameObjectsManager.findClosestObject(
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
        if (!idle) {
          return;
        }

        const targetEnemy =
          targetEnemyId && state.gameObjectsManager.objects[targetEnemyId];

        if (!targetEnemy) {
          targetEnemyId = undefined;

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

        // Check if it can shoot
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
          if (weapon.ammo > 0) {
            weapon.fireAtAngle(this.movement.angle);
          }
        }
      })();

      this.health.afterDeath(() => {
        state.gameObjectsManager.spawnObject(
          createBloodStain({ x: this.x, y: this.y }),
        );
      });
    },
  } as const;
}
