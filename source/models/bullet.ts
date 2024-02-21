import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import {
  createObjectCollisionManager,
  type Collidable,
  type Identifiable,
  type Updatable,
} from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 2;
const BASE_ATTACK = 5;

export interface Bullet extends Identifiable, Updatable, Vector, Collidable {
  type: "bullet";
  color: string;
  radius: number;
  belongsTo: string;
  speed: number;
  direction: Vector;
  attack: number;
  age: 0;
  maxAge: number; //ms
}

const BASE_MAX_AGE = 1000;

export function createBullet(
  o: Pick<Bullet, "x" | "y" | "direction" | "belongsTo"> &
    Partial<Pick<Bullet, "attack" | "speed">> & {
      size?: number;
    },
): Bullet {
  const speed = o.speed || 0.3;

  return {
    id: createId(),
    type: "bullet",
    color: "#f0f0f0",
    radius: o.size || RADIUS,
    collisionCircle: { radius: o.size || RADIUS },
    speed,
    collision: createObjectCollisionManager(),
    age: 0,
    maxAge: (Math.random() * BASE_MAX_AGE + BASE_MAX_AGE) / (speed * 2),
    ...o,
    attack: BASE_ATTACK * speed * (o.attack || 1),

    update(delta, getState) {
      this.age += delta;

      if (this.age > this.maxAge) {
        getState().gameObjectsManager.despawnObject(this);

        return;
      }

      const { cameraManager } = getState();

      this.x += this.direction.x * this.speed * delta;
      this.y += this.direction.y * this.speed * delta;

      this.collision.update(delta, getState, this);

      const otherObject = this.collision.collidesWithObjects[0];

      if (otherObject && otherObject.id !== this.belongsTo) {
        if ("health" in otherObject) {
          getState().gameObjectsManager.despawnObject(this);

          if ("shield" in otherObject && otherObject.shield.active) {
            otherObject.shield.absorbDamage(this.attack);

            playSound("shield hit", getSoundPosition(this, cameraManager));
          } else {
            otherObject.health.decrease(this.attack);

            playSound("basic hit", getSoundPosition(this, cameraManager));
          }
        }
      }
    },
  };
}
