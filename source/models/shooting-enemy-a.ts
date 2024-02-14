import { createBullet } from "./bullet";
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
    shootingInterval: createIntervalManager(1000 / 1),
    shootingRange: 300,
    shield: createObjectShieldManager(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // Find closest stranger
      let closestStranger = getState().gameObjectsManager.findClosestObject(
        this,
        (oo) => oo.type === "stranger_a",
      );

      if (!closestStranger) {
        closestStranger = getState().gameObjectsManager.findClosestObject(
          this,
          (oo) => oo.type === "plant_eater_a",
        );
      }

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
                speed: 0.4,
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

        if (
          Math.random() < 0.7 ||
          // Always spawn at least one enemy
          getState().gameObjectsManager.findObjectsByType("shooting_enemy_a")
            .length === 0
        ) {
          getState().gameObjectsManager.spawnObject(
            createShootingEnemyA({
              x: Math.random() * getState().world.size.x,
              y: Math.random() * getState().world.size.y,
            }),
          );
        }

        if (Math.random() < 0.4) {
          getState().gameObjectsManager.spawnObject(
            createShootingEnemyA({
              x: Math.random() * getState().world.size.x,
              y: Math.random() * getState().world.size.y,
            }),
          );
        }
      }
    },
  };
}
