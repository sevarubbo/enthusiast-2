import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import type { State } from "../services/state";

export const createWeaponBElement = (belongsTo: {
  x: number;
  y: number;
  collision: { circleRadius: number };
}) => {
  let angle = 0;
  let distance = 0;
  let direction = 1;

  return {
    ...createBaseObject({
      x: belongsTo.x,
      y: belongsTo.y,
    }),

    type: "weapon_b_element",
    color: "rgba(0, 0, 0, 0.5)",

    collision: createObjectCollisionManager({
      circleRadius: 20,
    }),

    attack: 10,

    update(delta: number, state: State) {
      // Move in circle around belongsTo
      const RADIUS =
        belongsTo.collision.circleRadius +
        this.collision.circleRadius +
        distance;
      const ANGLE_SPEED = 0.001;

      distance += delta * 0.01 * direction;

      if (distance > 100) {
        direction = -1;
      } else if (distance < 0) {
        direction = 1;
      }

      // Use delta to make the movement frame rate independent
      angle += ANGLE_SPEED * delta;

      this.setPosition({
        x: belongsTo.x + Math.cos(angle) * RADIUS,
        y: belongsTo.y + Math.sin(angle) * RADIUS,
      });

      const collidesWith = this.collision.collidesWithObjects[0];

      if (collidesWith && "health" in collidesWith) {
        if (collidesWith.type !== "shooting_enemy_a") {
          collidesWith.health.decrease(this.attack, this, state);
        }
      }
    },
  } as const;
};
