import { createBullet } from "./bullet";
import { createEnemyD } from "./enemy-d";
import { createShootingEnemyA } from "./shooting-enemy-a";
import { createTower } from "./tower";
import { createId } from "../helpers";
import { getSoundPosition, playSound } from "services/audio";
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

      if (otherObject) {
        this.color = "gray";

        // Change direction, like a billiard ball
        const direction = Math.atan2(
          this.y + speedVector.y - otherObject.y,
          this.x + speedVector.x - otherObject.x,
        );

        this.movement.start(vector.fromAngle(direction));
      } else {
        this.color = "white";
      }

      // After death
      if (this.health.current <= 0) {
        // Create shooting bullets in all directions
        const bulletsCount = 30;
        const angleStep = (2 * Math.PI) / bulletsCount;

        for (let i = 0; i < bulletsCount; i++) {
          // Each bullet should be at distance from the center of the enemy
          // equal to the radius of the enemy
          const bulletPosition = vector.add(
            this,
            vector.scale(
              vector.fromAngle(i * angleStep),
              this.collisionCircle.radius * 2,
            ),
          );

          getState().gameObjectsManager.spawnObject(
            createBullet({
              ...bulletPosition,
              direction: vector.fromAngle(i * angleStep),
              belongsTo: this.id,
              speed: Math.random() * 0.4 + 0.1,
            }),
          );
        }

        // Also turn into shooting enemy or tower
        if (Math.random() < 0.1) {
          getState().gameObjectsManager.spawnObject(
            createTower({ x: this.x, y: this.y }),
          );
        } else if (Math.random() < 0.3) {
          // create 5 enemies
          for (let i = 0; i < 5; i++) {
            const position = vector.add(this, {
              x: Math.random() * 50 - 25,
              y: Math.random() * 50 - 25,
            });

            getState().gameObjectsManager.spawnObject(createEnemyD(position));
          }

          playSound("egg hatch", {
            ...getSoundPosition(this, getState().cameraManager),
            volume: 1.5,
          });
        } else {
          getState().gameObjectsManager.spawnObject(
            createShootingEnemyA({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
