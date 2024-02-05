import { createBullet } from "./bullet";
import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Collidable,
  type Healthy,
  type IntervalManager,
  type Movable,
  createObjectMovementManager,
  createObjectCollisionManager,
  createIntervalManager,
} from "services/state";
import { vector } from "services/vector";

export interface ShootingEnemyA extends Movable, Collidable, Healthy {
  type: "shooting_enemy_a";
  shootingAngle: number;
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
}

export function createShootingEnemyA(
  o: Partial<Pick<ShootingEnemyA, "x" | "y">> = {},
): ShootingEnemyA {
  return {
    color: "#f00",
    id: createId(),
    type: "shooting_enemy_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.04 }),
    collision: createObjectCollisionManager(),
    targetPoint: null,
    shootingAngle: 0,
    shootingInterval: createIntervalManager(1000 / 1),
    shootingRange: 300,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // Find closest stranger
      const closestStranger = getState().gameObjectsManager.findClosestObject(
        this,
        (oo) => oo.type === "stranger_a",
      );

      if (closestStranger) {
        // Get to shooting range

        const distance = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        // Aim at the stranger
        this.shootingAngle = Math.atan2(
          closestStranger.y - this.y,
          closestStranger.x - this.x,
        );

        if (distance <= this.shootingRange) {
          const bulletPosition = vector.add(
            this,
            vector.scale(
              vector.fromAngle(this.shootingAngle),
              this.collisionCircle.radius,
            ),
          );

          // Shoot
          this.shootingInterval.fireIfReady(() => {
            getState().gameObjectsManager.spawnObject(
              createBullet({
                ...bulletPosition,
                direction: vector.fromAngle(this.shootingAngle),
                belongsTo: this.id,
                speed: 0.4,
              }),
            );
          });

          this.targetPoint = null;
          this.movement.stop();
        } else {
          this.targetPoint = {
            x: closestStranger.x,
            y: closestStranger.y,
          };
        }
      } else {
        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.health.current <= 0) {
        getState().gameObjectsManager.spawnObject(
          createShootingEnemyA({
            x: Math.random() * getState().world.size.x,
            y: Math.random() * getState().world.size.y,
          }),
        );
        getState().gameObjectsManager.spawnObject(
          createShootingEnemyA({
            x: Math.random() * getState().world.size.x,
            y: Math.random() * getState().world.size.y,
          }),
        );
      }
    },
  };
}
