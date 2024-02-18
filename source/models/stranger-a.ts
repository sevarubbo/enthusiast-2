import { createBullet } from "./bullet";
import { createExplosion } from "./helpers";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { getSoundPosition, playSound } from "services/audio";
import { getKeysPressed } from "services/io";
import {
  createObjectHealthManager,
  type Collidable,
  type Identifiable,
  type Movable,
  type Updatable,
  createObjectMovementManager,
  createObjectCollisionManager,
  type Healthy,
  createIntervalManager,
} from "services/state";
import { vector } from "services/vector";

type TypicalObject = Identifiable & Updatable & Collidable & Movable & Healthy;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  isHovered: boolean;
  isSelected: boolean;
  shootingAngle: number;
  shootingInterval: ReturnType<typeof createIntervalManager>;
  shield: ReturnType<typeof createObjectShieldManager>;
}

export function createStrangerA(
  o: Partial<Pick<StrangerA, "x" | "y">> = {},
): StrangerA {
  return {
    id: createId(),
    type: "stranger_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 30,
      selfHealing: true,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.2 }),
    collision: createObjectCollisionManager(),
    isHovered: false,
    isSelected: false,
    targetPoint: null,
    shootingAngle: 0,
    shootingInterval: createIntervalManager(1000 / 12),

    shield: createObjectShieldManager(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.shootingInterval.update(delta, getState);

      // START: Selectable object logic
      const { worldPointerPosition, isPointerDown } = getState().cameraManager;

      // Check for intersection with pointer
      if (
        Math.sqrt(
          (this.x - worldPointerPosition.x) ** 2 +
            (this.y - worldPointerPosition.y) ** 2,
        ) < this.collisionCircle.radius
      ) {
        this.isHovered = true;

        if (isPointerDown) {
          this.isSelected = true;
        }
      } else {
        this.isHovered = false;

        // if (this.isSelected && isPointerDown) {
        //   this.targetPoint = worldPointerPosition;
        // }
      }
      // END

      // START: Check collisions with world edges
      const { world } = getState();
      const { radius } = this.collisionCircle;

      if (this.x > world.size.x - radius) {
        this.x = world.size.x - radius;

        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.y > world.size.y - radius) {
        this.y = world.size.y - radius;

        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.x < radius) {
        this.x = radius;

        this.targetPoint = null;
        this.movement.stop();
      }

      if (this.y < radius) {
        this.y = radius;

        this.targetPoint = null;
        this.movement.stop();
      }
      // END

      // START: Check collisions with other objects
      const otherObject = this.collision.collidesWithObjects[0];

      if (otherObject) {
        this.targetPoint = null;
        this.movement.stop();

        return;
      }

      this.shootingAngle = Math.atan2(
        worldPointerPosition.y - this.y,
        worldPointerPosition.x - this.x,
      );

      const { keysPressed } = getKeysPressed();

      if (
        keysPressed.has("w") ||
        keysPressed.has("a") ||
        keysPressed.has("s") ||
        keysPressed.has("d")
      ) {
        this.movement.start(
          vector.fromAngle(
            Math.atan2(
              (keysPressed.has("s") ? 1 : 0) - (keysPressed.has("w") ? 1 : 0),
              (keysPressed.has("d") ? 1 : 0) - (keysPressed.has("a") ? 1 : 0),
            ) +
              this.shootingAngle +
              Math.PI / 2,
          ),
        );

        getState().cameraManager.worldTargetPoint = vector.create(
          this.x,
          this.y,
        );
      } else {
        this.movement.stop();
      }

      if (isPointerDown) {
        this.shootingInterval.fireIfReady(() => {
          const BULLET_OFFSET = this.collisionCircle.radius + 5;
          const bulletPosition = vector.add(
            this,
            vector.scale(vector.fromAngle(this.shootingAngle), BULLET_OFFSET),
          );

          const bulletDirection = vector.fromAngle(this.shootingAngle);

          // randomize bullet direction
          bulletDirection.x += Math.random() * 0.1 - 0.05;
          bulletDirection.y += Math.random() * 0.1 - 0.05;

          const bullet = createBullet({
            ...bulletPosition,
            direction: bulletDirection,
            belongsTo: this.id,
            attack: 2,
            speed: 0.8,
          });

          getState().gameObjectsManager.spawnObject(bullet);

          // Set the volume depending on camera position
          const { cameraManager } = getState();

          playSound("basic shot", getSoundPosition(this, cameraManager));
        });
      }

      // After death
      if (this.health.current <= 0) {
        createExplosion(this, getState, 60);
      }
    },
  };
}
