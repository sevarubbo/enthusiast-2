import { towerUpdate } from "./update";
import { createId } from "helpers";
import { createExplosion } from "models/helpers";
import { createShieldItem } from "models/shield-item";
import { createWeaponA } from "models/weapon-a";
import { createWeaponAItem } from "models/weapon-a-item";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type {
  CollidableCircle,
  Healthy,
  Identifiable,
  Updatable,
  Weapon,
} from "services/state";
import type { Vector } from "services/vector";

export interface Tower
  extends Identifiable,
    Updatable,
    Vector,
    CollidableCircle,
    Healthy {
  type: "tower";
  color: string;
  radius: 20;
  angle: number;
  targetAngle?: number;
  rotateSpeed: number;

  targetEnemyId?: string;
  aimError: number;
  shootingRange: number;
  weapon: Weapon;
}

export function createTower(o: Partial<Pick<Tower, "x" | "y">> = {}): Tower {
  return {
    id: createId(),
    type: "tower",
    x: o.x || 0,
    y: o.y || 0,
    color: "#6566b8",
    radius: 20,
    angle: 0,
    collisionCircle: {
      radius: 20,
    },
    health: createObjectHealthManager({
      maxHealth: 200,
      selfHealing: true,
    }),
    collision: createObjectCollisionManager({
      circleRadius: 20,
    }),
    aimError: 0.02,
    rotateSpeed: 2 / 1000,
    shootingRange: 350,
    weapon: createWeaponA({
      bulletSpeed: 0.9,
      fireRate: 10,
      maxAmmo: 4,
    }),

    update(delta, state) {
      this.health.update(delta, state, this);
      this.weapon.update(delta, state, this);

      towerUpdate(this, delta, state);

      // After death
      (() => {
        if (this.health.current <= 0) {
          createExplosion(this, state);
          state.gameObjectsManager.spawnObject(
            createWeaponAItem({ x: this.x, y: this.y }),
          );
          state.gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        }
      })();
    },
  };
}
