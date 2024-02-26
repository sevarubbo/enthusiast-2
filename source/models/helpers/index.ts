import { createBullet } from "../bullet";
import { createId } from "helpers";
import { getFirstObjectLineCollision } from "services/state/helpers";
import { vector } from "services/vector";
import type { Matrix } from "services/matrix";
import type { State } from "services/state";
import type { Vector } from "services/vector";
import type { StateObject } from "types";

export const createExplosion = (
  object: StateObject,
  state: State,
  size = 30,
  speed = 1,
) => {
  const bulletsCount = size;
  const angleStep = (2 * Math.PI) / bulletsCount;

  const collisionCircleRadius =
    "collisionCircle" in object
      ? object.collisionCircle.radius
      : "collision" in object && "circleRadius" in object.collision
        ? object.collision.circleRadius
        : null;

  if (!collisionCircleRadius) {
    throw new Error("No collision circle radius");
  }

  for (let i = 0; i < bulletsCount; i++) {
    // Each bullet should be at distance from the center of the enemy
    // equal to the radius of the enemy
    const bulletPosition = vector.add(
      object,
      vector.scale(
        vector.fromAngle(i * angleStep),
        collisionCircleRadius * 1.2,
      ),
    );

    state.gameObjectsManager.spawnObject(
      createBullet({
        ...bulletPosition,
        direction: vector.fromAngle(i * angleStep),
        belongsTo: object.id,
        speed: (Math.random() * 0.4 + 0.1) * speed,
      }),
    );
  }
};

export const canShootEnemy = (
  object: StateObject,
  enemy: StateObject,
  isFriend: (o: StateObject) => boolean,
  state: State,
): boolean => {
  const shootingSegment: Matrix = [
    vector.create(object.x, object.y),
    vector.create(enemy.x, enemy.y),
  ];

  const friendlyObjectInLine = getFirstObjectLineCollision(
    state,
    shootingSegment,
    (o) => {
      if (o === object) {
        return false;
      }

      if (o.type === "wall_a") {
        return true;
      }

      return isFriend(o);
    },
  );

  return !friendlyObjectInLine;
};

export const createBaseObject = (position: Vector) => {
  let x = position.x;
  let y = position.y;

  return {
    id: createId(),

    get x() {
      return x;
    },

    set x(value: number) {
      x = value;
    },

    set y(value: number) {
      y = value;
    },

    get y() {
      return y;
    },

    setPosition(p: Vector) {
      this.x = p.x;
      this.y = p.y;
    },
  };
};
