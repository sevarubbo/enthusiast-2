import { normalRandom } from "../../helpers";
import { createBullet } from "../bullet";
import { getSoundPosition, playSound } from "services/audio";
import { getFirstObjectLineCollision } from "services/state/helpers";
import { vector } from "services/vector";
import type { Tower } from ".";
import type { Matrix } from "services/matrix";
import type { State, Updatable } from "services/state";
import type { StateObject } from "types";

type ObjectUpdateFunction<T extends Updatable> = (
  self: T,
  ...args: Parameters<T["update"]>
) => void;

const isEnemy = (object: StateObject) => {
  return (
    object.type === "enemy" ||
    object.type === "shooting_enemy_a" ||
    object.type === "plant_eater_a" ||
    object.type === "stranger_a"
  );
};

const isNeutral = (object: StateObject) => {
  return object.type === "plant_a";
};

const canShootEnemy = (
  self: Tower,
  getState: () => State,
  enemy: StateObject,
): boolean => {
  if (vector.distance(self, enemy) > self.shootingRange) {
    return false;
  }

  const shootingSegment: Matrix = [
    vector.create(self.x, self.y),
    vector.create(enemy.x, enemy.y),
  ];
  const willCollideWithFriendlyObject = !!getFirstObjectLineCollision(
    getState,
    shootingSegment,
    (object) => {
      if (object === self) {
        return false;
      }

      if (isEnemy(object)) {
        return false;
      }

      if (isNeutral(object)) {
        return false;
      }

      return true;
    },
  );

  return !willCollideWithFriendlyObject;
};

const findTargetEnemy: ObjectUpdateFunction<Tower> = (self, d, getState) => {
  const { gameObjectsManager } = getState();

  // Find the closest enemy
  let closestDistance = Infinity;
  let closestEnemy: StateObject | null = null;

  for (const id in gameObjectsManager.objects) {
    const object = gameObjectsManager.getObject(id);
    const distance = vector.distance(self, object);

    if (!isEnemy(object)) {
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
  const bulletPosition = vector.add(
    self,
    vector.scale(vector.fromAngle(self.angle), BULLET_OFFSET),
  );
  const bullet = createBullet({
    ...bulletPosition,
    direction: vector.fromAngle(self.angle),
    belongsTo: self.id,
    attack: self.bulletStrength,
    speed: 0.4,
  });

  getState().gameObjectsManager.spawnObject(bullet);

  // Set the volume depending on camera position
  const { cameraManager } = getState();

  playSound("basic shot", getSoundPosition(self, cameraManager));
};

const rotateToAngle: ObjectUpdateFunction<Tower> = (self, delta) => {
  if (self.targetAngle === undefined) {
    return;
  }

  const angleDiff = self.targetAngle - self.angle;
  const angleDiffAbs = Math.abs(angleDiff);

  if (angleDiffAbs < 0.01) {
    self.angle = self.targetAngle;

    return;
  }

  const rotationDirection = angleDiff > 0 ? 1 : -1;
  const rotation =
    Math.min(self.rotateSpeed * delta, angleDiffAbs) * rotationDirection;

  self.angle += rotation;
};

export const towerUpdate: ObjectUpdateFunction<Tower> = (
  self,
  delta,
  getState,
) => {
  rotateToAngle(self, delta, getState);

  const { gameObjectsManager } = getState();

  if (!self.targetEnemyId) {
    findTargetEnemy(self, delta, getState);
  }

  const targetEnemy = self.targetEnemyId
    ? gameObjectsManager.objects[self.targetEnemyId]
    : undefined;

  if (!targetEnemy || !isEnemy(targetEnemy)) {
    self.targetEnemyId = undefined;

    return;
  }

  if (!canShootEnemy(self, getState, targetEnemy)) {
    findTargetEnemy(self, delta, getState);

    return;
  }

  const error = -self.aimError + normalRandom() * 2 * self.aimError;

  if (self.targetEnemyId) {
    // Shoot
    if (self.shotInterval.ready && self.angle === self.targetAngle) {
      shoot(self, delta, getState);
    }

    const targetMovementAdjustment = 32;

    // Adjust angle
    self.targetAngle =
      vector.getAngleBetweenTwoPoints(
        self,
        "movement" in targetEnemy
          ? vector.add(
              targetEnemy,
              vector.scale(
                targetEnemy.movement.speedVector,
                targetMovementAdjustment,
              ),
            )
          : targetEnemy,
      ) +
      error * Math.PI;
  }
};
