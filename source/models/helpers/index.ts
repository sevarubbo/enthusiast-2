import { createBullet } from "../bullet";
import { getFirstObjectLineCollision } from "services/state/helpers";
import { vector } from "services/vector";
import type { Matrix } from "services/matrix";
import type { State } from "services/state";
import type { StateObject } from "types";

export const createExplosion = (
  object: StateObject,
  state: State,
  size = 30,
) => {
  const bulletsCount = size;
  const angleStep = (2 * Math.PI) / bulletsCount;

  for (let i = 0; i < bulletsCount; i++) {
    // Each bullet should be at distance from the center of the enemy
    // equal to the radius of the enemy
    const bulletPosition = vector.add(
      object,
      vector.scale(
        vector.fromAngle(i * angleStep),
        object.collisionCircle.radius * 2,
      ),
    );

    state.gameObjectsManager.spawnObject(
      createBullet({
        ...bulletPosition,
        direction: vector.fromAngle(i * angleStep),
        belongsTo: object.id,
        speed: Math.random() * 0.4 + 0.1,
      }),
    );
  }
};

export const canShootEnemyWithoutFriendlyFire = (
  object: StateObject,
  enemy: StateObject,
  isFriend: (o: StateObject) => boolean,
  state: State,
): boolean => {
  const shootingSegment: Matrix = [
    vector.create(object.x, object.y),
    vector.create(enemy.x, enemy.y),
  ];

  return !getFirstObjectLineCollision(state, shootingSegment, (o) => {
    if (o === object) {
      return false;
    }

    return isFriend(o);
  });
};
