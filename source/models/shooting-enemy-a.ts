import { canShootEnemy } from "./helpers";
import { createItemRewardA } from "./item-reward-a";
import { createItemShotgun } from "./item-shotgun";
import { createShieldItem } from "./shield-item";
import { createWeaponA } from "./weapon-a";
import { createWeaponAItem } from "./weapon-a-item";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { vector } from "../services/vector";
import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Healthy,
  type Movable,
  createObjectMovementManager,
  createObjectCollisionManager,
} from "services/state";
import type { StateObject } from "../types";
import type { Weapon, CollidableCircle } from "services/state";

export interface ShootingEnemyA extends Movable, CollidableCircle, Healthy {
  type: "shooting_enemy_a";
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
  weapon: Weapon;
  targetEnemyId: string | undefined;
}

export function createShootingEnemyA(
  o: Partial<Pick<ShootingEnemyA, "x" | "y"> & { scale: number }> = {},
): ShootingEnemyA {
  const scale = Math.random() * 0.7 + 0.8;
  const defaultWeapon = createWeaponA({
    autoRefillRate: 0.5,
    fireRate: 1.1,
  });

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
    collision: createObjectCollisionManager({
      circleRadius: scale * 12,
    }),
    shootingRange: 300 * scale,
    shield: createObjectShieldManager(),
    weapon: defaultWeapon,
    targetEnemyId: undefined,

    update(delta, state) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.weapon.update(delta, state, this);

      const { gameObjectsManager } = state;

      const getTargetEnemy = () => {
        let enemy: StateObject | undefined = undefined;

        if (this.targetEnemyId) {
          enemy = gameObjectsManager.objects[this.targetEnemyId];
        }

        if (enemy) {
          return enemy;
        }

        enemy =
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
          ) ||
          undefined;

        this.targetEnemyId = enemy?.id;

        return enemy;
      };

      // Find targetEnemy
      const targetEnemy = getTargetEnemy();

      if (targetEnemy) {
        // Get to shooting range

        const distanceSq = vector.distanceSquared(this, targetEnemy);

        // Aim at targetEnemy
        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        if (
          distanceSq <= this.shootingRange ** 2 &&
          canShootEnemy(
            this,
            targetEnemy,
            (oo) => oo.type === "shooting_enemy_a" || oo.type === "boss_a",
            state,
          )
        ) {
          this.movement.setTargetPoint(null);

          // Shoot
          this.weapon.fireAtAngle(this.movement.angle);
        } else {
          this.movement.setTargetPoint(targetEnemy);
        }
      } else {
        this.movement.setTargetPoint(null);
      }

      // Get weapon
      (() => {
        if (targetEnemy) return;
        if (this.targetPoint) return;

        if (this.weapon.type === "machine_gun_b") return;

        const weaponItem = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "weapon_a_item",
        );

        if (!weaponItem) return;

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

      // Get shield
      (() => {
        if (targetEnemy) return;
        if (this.targetPoint) return;

        if (this.shield.active && this.shield.hp > 0) return;

        const shield = gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "shield_item",
        );

        if (!shield) return;

        this.targetPoint = {
          x: shield.x,
          y: shield.y,
        };
      })();

      // After death
      if (this.health.current <= 0) {
        state.statsManager.incrementEnemiesDied();

        // Drop shield
        if (Math.random() < 0.1) {
          state.gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.18) {
          // Drop weapon
          state.gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.09) {
          // Drop weapon
          state.gameObjectsManager.spawnObject(
            createItemShotgun({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.5) {
          state.gameObjectsManager.spawnObject(
            createItemRewardA({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
