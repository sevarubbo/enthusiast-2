import { createBloodStain } from "./blood-stain";
import { createExplosion } from "./helpers";
import { createDefaultGun } from "./weapon-a";
import { createObjectShieldManager } from "../services/state/objectShieldManager";
import { createId } from "helpers";
import { getKeysPressed } from "services/io";
import {
  createObjectHealthManager,
  type Identifiable,
  type Movable,
  type Updatable,
  createObjectMovementManager,
  createObjectCollisionManager,
  type Healthy,
} from "services/state";
import { vector } from "services/vector";
import type { Weapon, CollidableCircle } from "services/state";

type TypicalObject = Identifiable &
  Updatable &
  CollidableCircle &
  Movable &
  Healthy;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  shootingAngle: number;
  shield: ReturnType<typeof createObjectShieldManager>;
  weapon: Weapon;
}

export function createStrangerA(
  o: Partial<Pick<StrangerA, "x" | "y">> = {},
): StrangerA {
  const defaultWeapon = createDefaultGun();

  return {
    id: createId(),
    type: "stranger_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 12 },
    health: createObjectHealthManager({
      maxHealth: 30,
      selfHealing: true,
      woundSound: "health critical",
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.2 }),
    collision: createObjectCollisionManager({
      circleRadius: 12,
    }),
    targetPoint: null,
    shootingAngle: 0,

    weapon: defaultWeapon,

    shield: createObjectShieldManager(),

    update(delta, state) {
      this.health.update(delta, state, this);
      this.movement.update(delta, state, this);
      this.weapon.update(delta, state, this);

      // START: Selectable object logic
      const { worldPointerPosition, isPointerDown } = state.cameraManager;

      // START: Check collisions with world edges
      const { world } = state;
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

        state.cameraManager.followPoint = vector.create(this.x, this.y);
      } else {
        state.cameraManager.followPoint = null;
        this.movement.stop();
      }

      if (isPointerDown) {
        this.weapon.fireAtAngle(this.shootingAngle);
      }

      // Drop weapon when ammo is empty
      (() => {
        if (this.weapon.type !== "default" && this.weapon.ammo <= 0) {
          this.weapon = defaultWeapon;
        }
      })();

      // After death
      this.health.afterDeath(() => {
        state.gameObjectsManager.spawnObject(
          createBloodStain({ x: this.x, y: this.y }),
        );

        createExplosion(this, state, 60);
        state.cameraManager.followPoint = null;

        state.statsManager.strangerDied = true;
      });
    },
  };
}
