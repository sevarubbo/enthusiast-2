import { createBaseObject } from "./helpers";
import { vector } from "../services/vector";
import type { State } from "../services/state";
import type { Vector } from "../services/vector";
import type { CollidableObject } from "../types";
import type { Bullet } from "./bullet";

export const createBloodParticle = ({
  position,
  direction,
  speed: initialSpeed = 10,
}: {
  position: Vector;
  direction: Vector;
  speed: number;
}) => {
  let timeLeftToLive = 10000 + Math.random() * 10000;
  let speed = initialSpeed;
  const gravity = 1 / 500;

  return {
    ...createBaseObject(position),
    type: "blood_particle",
    color: "rgba(255, 0, 0, 0.5)",
    timeToLive: 500,
    direction,

    get timeLeftToLive() {
      return timeLeftToLive;
    },

    update(delta: number, state: State) {
      timeLeftToLive -= delta;

      speed -= initialSpeed * delta * gravity;
      if (speed < 0) speed = 0;

      this.setPosition({
        x: this.x + direction.x * speed * delta,
        y: this.y + direction.y * speed * delta,
      });

      if (timeLeftToLive <= 0) {
        state.gameObjectsManager.despawnObject(this);
      }
    },
  } as const;
};

export const createBloodExplosion = (
  object: CollidableObject,
  state: State,
  direction: Vector,
  size = 20,
  speed = 1,
) => {
  const bulletsCount = size;

  const collisionCircleRadius =
    "circleRadius" in object.collision ? object.collision.circleRadius : null;

  if (!collisionCircleRadius) {
    throw new Error("No collision circle radius");
  }

  for (let i = 0; i < bulletsCount; i++) {
    const particleDirection = vector.fromAngle(
      vector.toAngle(direction) + (i - (size - 1) / 2) * 0.1,
    );

    const position = vector.add(
      object,
      vector.scale(particleDirection, collisionCircleRadius * 1.2),
    );

    state.gameObjectsManager.spawnObject(
      createBloodParticle({
        position,
        direction: particleDirection,
        speed: (Math.random() * 0.7 + 0.4) * speed,
      }),
    );
  }
};

export const createBloodWhenHitByBullet = (
  object: CollidableObject,
  state: State,
) => {
  if ("shield" in object && object.shield.active) return;

  const bullet = object.collision.collidesWithObjects.find(
    (oo) => oo.type === "bullet" && oo.belongsTo !== object.id,
  ) as Bullet | undefined;

  if (bullet) {
    createBloodExplosion(object, state, bullet.direction, 5, bullet.speed);
  }
};
