import { createId } from "../helpers";
import {
  createObjectCollisionManager,
  createObjectHealthManager,
  createObjectMovementManager,
} from "services/state";
import { vector } from "services/vector";
import type {
  ObjectHealthManager,
  Collidable,
  Identifiable,
  Updatable,
  Movable,
} from "services/state";

export interface EnemyC extends Identifiable, Updatable, Collidable, Movable {
  type: "enemyC";
  color: "gray" | "white";
  radius: 12;
  health: ObjectHealthManager;
}

export function createEnemyC(o: Partial<Pick<EnemyC, "x" | "y">> = {}): EnemyC {
  return {
    id: createId(),
    type: "enemyC",
    x: o.x || 0,
    y: o.y || 0,
    color: "white",
    radius: 12,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 10,
    }),
    collision: createObjectCollisionManager(),
    targetPoint: null,

    movement: createObjectMovementManager({
      maxSpeed: 0.1,
      direction: vector.fromAngle(Math.random() * 2 * Math.PI),
    }),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);

      const { world } = getState();

      // Check collisions with world edges
      const { radius } = this.collisionCircle;
      const { speedVector } = this.movement;

      if (this.x < radius) {
        this.x = radius;
        this.movement.setSpeedVector({
          ...speedVector,
          x: Math.abs(speedVector.x),
        });
      } else if (this.x > world.size.x - radius) {
        this.movement.setSpeedVector({
          ...speedVector,
          x: -Math.abs(speedVector.x),
        });
      }

      if (this.y < radius) {
        this.y = radius;
        this.movement.setSpeedVector({
          ...speedVector,
          y: Math.abs(speedVector.y),
        });
      } else if (this.y > world.size.y - radius) {
        this.movement.setSpeedVector({
          ...speedVector,
          y: -Math.abs(speedVector.y),
        });
      }

      // Collision with other objects
      const otherObject = this.collision.collidesWithObjects[0];

      if (otherObject && otherObject.type !== "bullet") {
        this.color = "gray";
        const collisionNorm = vector.normalize(
          vector.subtract(otherObject, this),
        );

        const objectSpeedVector =
          "movement" in otherObject
            ? otherObject.movement.speedVector
            : vector.zero;

        const relativeVelocity = {
          x: speedVector.x - objectSpeedVector.x,
          y: speedVector.y - objectSpeedVector.y,
        };

        const collisionSpeed =
          relativeVelocity.x * collisionNorm.x +
          relativeVelocity.y * collisionNorm.y;

        this.movement.setSpeedVector(
          vector.scale(collisionNorm, -collisionSpeed),
        );
      } else {
        this.color = "white";
      }
    },
  };
}
