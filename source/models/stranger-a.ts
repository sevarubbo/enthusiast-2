import { createExplosion } from "./helpers";
import { createMachineGun } from "./weapon-a";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
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
} from "services/state";
import { vector } from "services/vector";
import type { Weapon } from "services/state";

type TypicalObject = Identifiable & Updatable & Collidable & Movable & Healthy;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  isHovered: boolean;
  isSelected: boolean;
  shootingAngle: number;
  shield: ReturnType<typeof createObjectShieldManager>;
  weapon: Weapon;
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

    weapon: createMachineGun(),

    shield: createObjectShieldManager(),

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.weapon.update(delta, getState, this);

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

        getState().cameraManager.followPoint = vector.create(this.x, this.y);
      } else {
        getState().cameraManager.followPoint = null;
        this.movement.stop();
      }

      if (isPointerDown) {
        this.weapon.fireAtAngle(this.shootingAngle);
      }

      if (this.weapon.type === "machine_gun_b" && this.weapon.ammo <= 0) {
        this.weapon = createMachineGun();
      }

      // After death
      if (this.health.current <= 0) {
        createExplosion(this, getState, 60);
        getState().cameraManager.followPoint = null;

        getState().statsManager.strangerDied = true;
      }
    },
  };
}
