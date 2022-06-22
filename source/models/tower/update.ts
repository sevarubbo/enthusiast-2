import { createBullet } from "../bullet";
import { getFirstObjectLineCollision } from "../helpers";
import { vector } from "services/vector";
import type { Tower } from ".";
import type { Enemy } from "models";
import type { Matrix } from "services/matrix";
import type { Updatable } from "services/state";

type ObjectUpdateFunction<T extends Updatable> = (self: T, ...args: Parameters<T["update"]>) => void;

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

    // Check collision BEGIN
    const shootingSegment: Matrix = [vector.create(self.x, self.y), vector.create(object.x, object.y)];
    const willCollideWithFriendlyObject = !!(getFirstObjectLineCollision(getState, shootingSegment));
    // Check collision END

    if (willCollideWithFriendlyObject) {
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

  const BULLET_OFFSET = 20;
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

  self.angle = vector.getAngleBetweenTwoPoints(self, targetEnemy);

  // Shoot
  if (self.targetEnemyId && self.shotInterval.ready) {
    shoot(self, delta, getState);
  }
};
