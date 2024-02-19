import { createBullet } from "./bullet";
import { createShootingEnemyB } from "./enemy-d";
import { createShieldItem } from "./shield-item";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
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
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
}

export function createShootingEnemyA(
  o: Partial<Pick<ShootingEnemyA, "x" | "y"> & { scale: number }> = {},
): ShootingEnemyA {
  const scale = Math.random() * 0.7 + 0.8;

  return {
    color: "#f00",
    id: createId(),
    type: "shooting_enemy_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: scale * 12 },
    health: createObjectHealthManager({
      maxHealth: 8 + scale * 8,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.05 / scale }),
    collision: createObjectCollisionManager(),
    targetPoint: null,
    shootingInterval: createIntervalManager(500 + scale * 500),
    shootingRange: 300 * scale,
    shield: createObjectShieldManager(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // Find the closest stranger
      const closestStranger = getState().gameObjectsManager.findClosestObject(
        {
          x: this.x,
          y: this.y,
        },
        (oo) =>
          oo.type === "stranger_a" ||
          oo.type === "plant_eater_a" ||
          oo.type === "shooting_enemy_b",
      );

      if (closestStranger) {
        // Get to shooting range

        const distance = Math.sqrt(
          (closestStranger.x - this.x) ** 2 + (closestStranger.y - this.y) ** 2,
        );

        // Aim at the stranger
        this.movement.angle = Math.atan2(
          closestStranger.y - this.y,
          closestStranger.x - this.x,
        );

        if (distance <= this.shootingRange) {
          const bulletPosition = vector.add(
            this,
            vector.scale(
              vector.fromAngle(this.movement.angle),
              this.collisionCircle.radius,
            ),
          );

          // Shoot
          this.shootingInterval.fireIfReady(() => {
            getState().gameObjectsManager.spawnObject(
              createBullet({
                ...bulletPosition,
                direction: vector.fromAngle(this.movement.angle),
                belongsTo: this.id,
                speed: 0.8,
              }),
            );

            playSound(
              "basic shot",
              getSoundPosition(this, getState().cameraManager),
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

      // After death
      if (this.health.current <= 0) {
        getState().statsManager.incrementEnemiesDied();

        // Check if the position is not too close to the player
        const stranger =
          getState().gameObjectsManager.findObjectsByType("stranger_a")[0];

        // Respawning
        (() => {
          if (!stranger) {
            return;
          }

          if (Math.random() < 0.99) {
            const randomPosition = getState().world.getRandomPoint();

            if (
              !(
                vector.distance(randomPosition, stranger) <
                this.shootingRange * 3
              ) ||
              getState().gameObjectsManager.findObjectsByType(
                "shooting_enemy_a",
              ).length < 0
            ) {
              getState().gameObjectsManager.spawnObject(
                createShootingEnemyA(randomPosition),
              );
            }
          }

          if (Math.random() < 0.6) {
            const randomPosition = getState().world.getRandomPoint();

            if (
              !(
                vector.distance(randomPosition, stranger) <
                this.shootingRange * 3
              )
            ) {
              getState().gameObjectsManager.spawnObject(
                createShootingEnemyA(randomPosition),
              );
            }
          }
        })();

        if (Math.random() < 0.3) {
          // create 5 enemies
          for (let i = 0; i < 5; i++) {
            const position = vector.add(this, {
              x: Math.random() * 50 - 25,
              y: Math.random() * 50 - 25,
            });

            getState().gameObjectsManager.spawnObject(
              createShootingEnemyB(position),
            );
          }

          playSound("egg hatch", {
            ...getSoundPosition(this, getState().cameraManager),
            volume: 3,
          });
        }

        if (Math.random() < 0.1) {
          getState().gameObjectsManager.spawnObject(
            createShieldItem({ x: this.x, y: this.y }),
          );
        }
      }
    },
  };
}
