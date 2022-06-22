import { normalRandom } from "../../helpers";
import { getFirstObjectLineCollision } from "../../services/state/helpers";
import { createBullet } from "../bullet";
import { vector } from "services/vector";
import type { Tower } from ".";
import type { Enemy } from "models";
import type { Matrix } from "services/matrix";
import type { State, Updatable } from "services/state";

type ObjectUpdateFunction<T extends Updatable> = (self: T, ...args: Parameters<T["update"]>) => void;

const canShootEnemy = (self: Tower, getState: () => State, enemy: Enemy): boolean => {
  const shootingSegment: Matrix = [vector.create(self.x, self.y), vector.create(enemy.x, enemy.y)];
  const willCollideWithFriendlyObject = !!(getFirstObjectLineCollision(getState, shootingSegment, object => {
    if (object === self) {
      return false;
    }

    if (["bullet", "enemy"].includes(object.type)) {
      return false;
    }

    return true;
  }));

  return !willCollideWithFriendlyObject;
};

const findTargetEnemy: ObjectUpdateFunction<Tower> = (self, d, getState) => {
  const { gameObjectsManager } = getState();

  // Find the closest enemy
  let closestDistance = Infinity;
  let closestEnemy: Enemy | null = null;

  for (const id in gameObjectsManager.objects) {
    const object = gameObjectsManager.objects[id];
    const distance = vector.distance(self, object);

    if (object.type !== "enemy") {
      continue;
    }

    if (!canShootEnemy(self, getState, object)) {
      continue;
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closestEnemy = object;
    }
  }

  self.targetEnemyId = closestEnemy?.id;
};

const shoot: ObjectUpdateFunction<Tower> = (self, delta, getState) => {
  self.shotInterval.fire();

  const BULLET_OFFSET = 30;
  const bulletPosition = vector.add(self, vector.scale(vector.fromAngle(self.angle), BULLET_OFFSET));
  const bullet = createBullet({
    ...bulletPosition,
    direction: vector.fromAngle(self.angle),
    belongsTo: self.id,
  });

  getState().gameObjectsManager.spawnObject(bullet);
};

export const towerUpdate: ObjectUpdateFunction<Tower> = (self, delta, getState) => {
  self.shotInterval.update(delta, getState);
  const { gameObjectsManager } = getState();

  if (!self.targetEnemyId) {
    findTargetEnemy(self, delta, getState);
  }

  const targetEnemy = self.targetEnemyId ? gameObjectsManager.objects[self.targetEnemyId] : undefined;

  if (!targetEnemy || targetEnemy.type !== "enemy") {
    self.targetEnemyId = undefined;

    return;
  }

  if (!canShootEnemy(self, getState, targetEnemy)) {
    findTargetEnemy(self, delta, getState);

    return;
  }

  const error = -self.aimError + normalRandom() * 2 * self.aimError;

  // Shoot
  if (self.targetEnemyId && self.shotInterval.ready) {
    self.angle = vector.getAngleBetweenTwoPoints(self, targetEnemy) + error * Math.PI;
    shoot(self, delta, getState);
  }
};
