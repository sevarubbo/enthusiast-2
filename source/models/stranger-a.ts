import { createId } from "helpers";
import {
  createObjectHealthManager,
  type Collidable,
  type Identifiable,
  type Movable,
  type ObjectHealthManager,
  type Updatable,
  createObjectMovementManager,
} from "services/state";
import { type Vector } from "services/vector";

type TypicalObject = Identifiable & Updatable & Collidable & Movable;

export interface StrangerA extends TypicalObject {
  type: "stranger_a";
  targetPoint?: Vector;
  health: ObjectHealthManager;
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
    health: createObjectHealthManager(10),
    movement: createObjectMovementManager({ maxSpeed: 0.1 }),
    isHovered: false,
    isSelected: false,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.movement.update(delta, getState, this);

      if (this.targetPoint) {
        const { didReach } = this.movement.moveToTargetPoint(
          this,
          this.targetPoint,
        );

        if (didReach) {
          this.targetPoint = undefined;
        }
      }

      // Selectable object logic
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

        if (isPointerDown) {
          this.targetPoint = worldPointerPosition;
        }
      }
    },
  };
}
