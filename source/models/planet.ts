import { createId } from "helpers";
import {
  createObjectMovementManager,
  type Collidable,
  type Movable,
  createObjectCollisionManager,
} from "services/state";

export interface Planet extends Movable, Collidable {
  type: "planet";
  color: "yellow";
}

export function createPlanet(o: Partial<Pick<Planet, "x" | "y">> = {}): Planet {
  return {
    id: createId(),
    type: "planet",
    color: "yellow",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 50 },
    collision: createObjectCollisionManager(),
    movement: createObjectMovementManager({
      maxSpeed: 1,
    }),

    update(delta, getState) {
      this.movement.update(delta, getState, this);
      this.collision.update(delta, getState, this);

      // Move in a circle
      const speed = 0.0001;
      const radius = 200;
      const angle = speed * delta;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      this.movement.setSpeedVector({ x, y });
    },
  };
}
