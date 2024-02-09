import { towerUpdate } from "./update";
import { createId } from "helpers";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
} from "services/state";
import type {
  Collidable,
  Healthy,
  Identifiable,
  Updatable,
  IntervalManager,
} from "services/state";
import type { Vector } from "services/vector";

const SHOOTING_SPEED = 3;
const BULLET_STRENGTH = 3;

export interface Tower
  extends Identifiable,
    Updatable,
    Vector,
    Collidable,
    Healthy {
  type: "tower";
  color: "green";
  radius: 20;
  shotInterval: IntervalManager;
  angle: number;
  targetAngle?: number;
  rotateSpeed: number;

  targetEnemyId?: string;
  aimError: number;
  bulletStrength: typeof BULLET_STRENGTH;
  shootingRange: number;
}

export function createTower(o: Partial<Pick<Tower, "x" | "y">> = {}): Tower {
  return {
    id: createId(),
    type: "tower",
    x: o.x || 0,
    y: o.y || 0,
    color: "green",
    radius: 20,
    shotInterval: createIntervalManager(1000 / SHOOTING_SPEED),
    angle: 0,
    collisionCircle: {
      radius: 20,
    },
    health: createObjectHealthManager({
      maxHealth: 300,
      selfHealing: true,
    }),
    collision: createObjectCollisionManager(false),
    aimError: 0.02,
    bulletStrength: BULLET_STRENGTH,
    rotateSpeed: 2 / 1000,
    shootingRange: 300,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shotInterval.update(delta, getState);

      towerUpdate(this, delta, getState);
    },
  };
}
