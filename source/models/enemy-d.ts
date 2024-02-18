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

export interface EnemyD extends Movable, Collidable, Healthy {
  type: "shooting_enemy_b";
  shootingInterval: IntervalManager;
  shootingRange: number;
  color: string;
  shield: ReturnType<typeof createObjectShieldManager>;
}

export function createShootingEnemyB(
  o: Partial<Pick<EnemyD, "x" | "y"> & { scale: number }> = {},
): EnemyD {
  const scale = 0.05;

  return {
    color: "#a30",
    id: createId(),
    type: "shooting_enemy_b",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: scale * 12 },
    health: createObjectHealthManager({
      maxHealth: 8 + scale * 8,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.1 / scale }),
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
      let closestStranger = getState().gameObjectsManager.findClosestObject(
        {
          x: this.x,
          y: this.y,
        },
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
        //
      }
    },
  };
}
