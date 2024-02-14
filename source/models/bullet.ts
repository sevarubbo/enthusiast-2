import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import { matrix } from "services/matrix";
import {
  createObjectCollisionManager,
  type Collidable,
  type Identifiable,
  type Updatable,
} from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 2;
const ATTACK = 3;

export interface Bullet extends Identifiable, Updatable, Vector, Collidable {
  type: "bullet";
  color: "yellow";
  radius: typeof RADIUS;
  belongsTo: string;
  speed: number;
  direction: Vector;
  attack: number;
}

export function createBullet(
  o: Pick<Bullet, "x" | "y" | "direction" | "belongsTo"> &
    Partial<Pick<Bullet, "attack" | "speed">>,
): Bullet {
  return {
    id: createId(),
    type: "bullet",
    color: "yellow",
    radius: RADIUS,
    collisionCircle: { radius: RADIUS },
    speed: 0.2,
    attack: ATTACK,
    collision: createObjectCollisionManager(),
    ...o,

    update(delta, getState) {
      this.collision.update(delta, getState, this);
      const { world, gameObjectsManager, cameraManager } = getState();

      this.x += this.direction.x * this.speed * delta;
      this.y += this.direction.y * this.speed * delta;
      const worldBox = matrix.create(0, 0, world.size.x, world.size.y);

      if (!matrix.withinBox(this, worldBox)) {
        gameObjectsManager.despawnObject(this);
      }

      const otherObject = this.collision.collidesWithObjects[0];

      if (otherObject && otherObject.id !== this.belongsTo) {
        if ("health" in otherObject) {
          gameObjectsManager.despawnObject(this);

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
