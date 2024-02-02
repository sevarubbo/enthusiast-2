import { createId } from "../helpers";
import { circle } from "../services/circle";
import { createObjectHealthManager, createObjectMovementManager } from "services/state";
import { vector } from "services/vector";
import type { ObjectHealthManager, Collidable, Identifiable, Updatable, Movable } from "services/state";
import type { Vector } from "services/vector";

export interface EnemyC extends Identifiable, Updatable, Vector, Collidable, Movable {
  type: "enemyC";
  color: "gray" | "white";
  radius: 12;
  targetPoint?: Vector;
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
    health: createObjectHealthManager(10),

    movement: createObjectMovementManager({ maxSpeed: 0.1, direction: vector.fromAngle(Math.random() * 2 * Math.PI) }),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      const { world, gameObjectsManager } = getState();

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
      for (const id in gameObjectsManager.objects) {
        const object = gameObjectsManager.objects[id];

        if (object === this) {
          continue;
        }

        const collides = circle.circlesCollide({
          x: this.x,
          y: this.y,
          radius: this.collisionCircle.radius,
        }, {
          x: object.x,
          y: object.y,
          radius: object.collisionCircle.radius,
        });

        this.color = collides ? "gray" : "white";

        if (collides) {
          const collisionNorm = vector.normalize(vector.subtract(object, this));
          const objectSpeedVector = "movement" in object ? object.movement.speedVector : vector.zero;
          const relativeVelocity = { x: speedVector.x - objectSpeedVector.x, y: speedVector.y - objectSpeedVector.y };

          const collisionSpeed = relativeVelocity.x * collisionNorm.x + relativeVelocity.y * collisionNorm.y;

          if (collisionSpeed <= 0) {
            continue;
          }

          const adjustedPosition = vector.add(
            object,
            vector.scale(collisionNorm, -(this.collisionCircle.radius + object.collisionCircle.radius)),
          );

          this.x = adjustedPosition.x;
          this.y = adjustedPosition.y;

          this.movement.setSpeedVector(vector.scale(collisionNorm, -collisionSpeed));
        }
      }
    },
  };
}
