import { towerUpdate } from "./update";
import { createId } from "helpers";
import { createWeaponA } from "models/weapon-a";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type {
  Collidable,
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
    Collidable,
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
    collision: createObjectCollisionManager(),
    aimError: 0.02,
    rotateSpeed: 2 / 1000,
    shootingRange: 350,
    weapon: createWeaponA({
      bulletSpeed: 0.9,
      fireRate: 10,
    }),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.weapon.update(delta, getState, this);

      towerUpdate(this, delta, getState);
    },
  };
}
