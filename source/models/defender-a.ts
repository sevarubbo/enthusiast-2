import { createBullet, type Bullet } from "./bullet";
import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import {
  createIntervalManager,
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
  type Collidable,
  type Healthy,
  type IntervalManager,
  type Movable,
} from "services/state";
import { vector } from "services/vector";

export interface DefenderA extends Movable, Collidable, Healthy {
  type: "defender_a";
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
  targetEnemyId: string | undefined;
}

export function createDefenderA(
  options: Partial<Pick<DefenderA, "x" | "y">> = {},
): DefenderA {
  return {
    color: "#a50",
    id: createId(),
    type: "defender_a",
    x: options.x || 0,
    y: options.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 20,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.08 }),
    collision: createObjectCollisionManager(),
    targetPoint: null,
    shootingInterval: createIntervalManager(1000 / 3),
    shootingRange: 300,
    targetEnemyId: undefined,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // Defend StrangerA
      (() => {
        // Find closest stranger
        const closestStranger = getState().gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "stranger_a",
        );

        if (!closestStranger) {
          this.movement.stop();

          return;
        }

        const distanceToStranger = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        if (distanceToStranger > this.shootingRange) {
          this.targetPoint = {
            x: closestStranger.x,
            y: closestStranger.y,
          };
          this.targetEnemyId = undefined;

          return;
        }

        if (!this.targetEnemyId) {
          this.targetPoint = null;
          this.movement.stop();
        }

        // If stranger hit by a bullet
        const enemyBullet = closestStranger.collision.collidesWithObjects.find(
          (o) => o.type === "bullet",
        ) as Bullet | undefined;

        if (enemyBullet && enemyBullet.belongsTo !== closestStranger.id) {
          this.targetEnemyId = enemyBullet.belongsTo;
        }

        const targetEnemy =
          this.targetEnemyId &&
          getState().gameObjectsManager.objects[this.targetEnemyId];

        if (!targetEnemy) {
          this.targetEnemyId = undefined;

          return;
        }

        const distanceToEnemy = vector.distance(this, targetEnemy);

        if (distanceToEnemy > this.shootingRange) {
          this.targetPoint = {
            x: targetEnemy.x,
            y: targetEnemy.y,
          };

          return;
        }

        this.targetPoint = null;
        this.movement.stop();

        this.movement.angle = Math.atan2(
          targetEnemy.y - this.y,
          targetEnemy.x - this.x,
        );

        this.shootingInterval.fireIfReady(() => {
          if (this.shootingInterval.ready) {
            getState().gameObjectsManager.spawnObject(
              createBullet({
                x: this.x,
                y: this.y,
                direction: vector.fromAngle(this.movement.angle),
                belongsTo: this.id,
              }),
            );

            playSound(
              "basic shot",
              getSoundPosition(this, getState().cameraManager),
            );
          }
        });
      })();
    },
  };
}
