import { normalRandom } from "../../helpers";
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

type TowerEnemy =
  | "shooting_enemy_a"
  | "defender_a"
  | "enemy"
  | "plant_eater_a"
  | "stranger_a"
  | "shooting_enemy_b"
  | "enemyC"
  | "slashing_enemy_a"
  | "boss_a";

const isEnemy = (object: StateObject) => {
  return (
    object.type === "shooting_enemy_a" ||
    object.type === "defender_a" ||
    object.type === "enemy" ||
    object.type === "plant_eater_a" ||
    object.type === "stranger_a" ||
    object.type === "shooting_enemy_b" ||
    object.type === "enemyC" ||
    object.type === "slashing_enemy_a" ||
    object.type === "boss_a"
  );
};

const isNeutral = (object: StateObject) => {
  return object.type === "plant_a" || object.type === "bullet";
};

const canShootEnemy = (
  self: Tower,
  state: State,
  enemy: StateObject,
): boolean => {
  if (vector.distance(self, enemy) > self.shootingRange) {
    return false;
  }

  const shootingSegment: Matrix = [
    vector.create(self.x, self.y),
    vector.create(enemy.x, enemy.y),
  ];
  const willCollideWithFriendlyObject = getFirstObjectLineCollision(
    state,
    shootingSegment,
    (object) => {
      if (object === self) {
        return false;
      }

      if (!("health" in object)) {
        return true;
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

const findTargetEnemy: ObjectUpdateFunction<Tower> = (self, d, state) => {
  const { gameObjectsManager } = state;
  const closestEnemy = (() => {
    for (const enemyType of [
      "stranger_a",
      "defender_a",
      "slashing_enemy_a",
      "shooting_enemy_a",
      "shooting_enemy_b",
      "boss_a",
      "enemy",
      "enemyC",
      "plant_eater_a",
    ] as const) {
      const enemy = gameObjectsManager.findClosestObjectByType(
        self,
        enemyType as TowerEnemy,
      );

      if (enemy && canShootEnemy(self, state, enemy)) {
        return enemy;
      }
    }

    return null;
  })();

  self.targetEnemyId = closestEnemy?.id;
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
  state,
) => {
  rotateToAngle(self, delta, state);

  const { gameObjectsManager } = state;

  if (!self.targetEnemyId) {
    findTargetEnemy(self, delta, state);
  }

  const targetEnemy = self.targetEnemyId
    ? gameObjectsManager.objects[self.targetEnemyId]
    : undefined;

  if (!targetEnemy) {
    self.targetEnemyId = undefined;

    return;
  }

  if (!canShootEnemy(self, state, targetEnemy)) {
    findTargetEnemy(self, delta, state);
  }

  const error = -self.aimError + normalRandom() * 2 * self.aimError;

  if (self.targetEnemyId) {
    // Shoot
    if (self.angle === self.targetAngle) {
      if (self.weapon.ammo) {
        self.weapon.fireAtAngle(self.angle);
      }
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
