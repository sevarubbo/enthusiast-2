import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Collidable,
  type Identifiable,
  type Movable,
  type Updatable,
  createObjectMovementManager,
  createObjectCollisionManager,
  type Healthy,
  type ObjectCollisionManager,
} from "services/state";

type TypicalObject = Identifiable & Updatable & Collidable & Movable & Healthy;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  collision: ObjectCollisionManager;
  isHovered: boolean;
  isSelected: boolean;
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
      maxHealth: 10,
    }),
    movement: createObjectMovementManager({ maxSpeed: 0.1 }),
    collision: createObjectCollisionManager(),
    isHovered: false,
    isSelected: false,
    targetPoint: null,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);

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

        if (this.isSelected && isPointerDown) {
          this.targetPoint = worldPointerPosition;
        }
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

      // // START: Check collisions with other objects
      // const { gameObjectsManager } = getState();

      // for (const id in gameObjectsManager.objects) {
      //   const object = gameObjectsManager.objects[id];

      //   if (object === this) {
      //     continue;
      //   }

      //   const collides =
      //     Math.sqrt((this.x - object.x) ** 2 + (this.y - object.y) ** 2) <
      //     this.collisionCircle.radius + object.collisionCircle.radius;

      //   if (collides) {
      //     this.movement.stop();
      //     this.targetPoint = null;

      //     const direction = Math.atan2(this.y - object.y, this.x - object.x);

      //     this.x += Math.cos(direction);
      //     this.y += Math.sin(direction);
      //   }
      // }
      // // END

      // if (this.collision.collidesWithObjects[0]) {
      //   this.movement.stop();
      //   this.targetPoint = null;
      // }
    },
  };
}
