import { createId } from "helpers";
import { circle } from "services/circle";
import { matrix } from "services/matrix";
import type { Collidable, Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

const RADIUS = 1;

export interface Bullet extends Identifiable, Updatable, Vector, Collidable {
  type: "bullet";
  color: "yellow";
  radius: typeof RADIUS;
  belongsTo: string;
  speed: 0.2;
  direction: Vector;
}

export function createBullet(o: Pick<Bullet, "x" | "y" | "direction" | "belongsTo">): Bullet {
  return {
    id: createId(),
    type: "bullet",
    color: "yellow",
    radius: RADIUS,
    collisionCircle: { radius: RADIUS },
    speed: 0.2,
    ...o,

    update(delta, getState) {
      const { world, gameObjectsManager } = getState();

      this.x += this.direction.x * this.speed * delta;
      this.y += this.direction.y * this.speed * delta;
      const worldBox = matrix.create(0, 0, world.size.x, world.size.y);

      if (!matrix.withinBox(this, worldBox)) {
        gameObjectsManager.despawnObject(this);
      }

      // Collision
      for (const id in gameObjectsManager.objects) {
        const object = gameObjectsManager.objects[id];

        if ((object === this) || !("collisionCircle" in object)) {
          continue;
        }

        const collides = circle.circlesCollide({
          x: this.x,
          y: this.y,
          radius: this.collisionCircle.radius,
        },
        {
          x: object.x,
          y: object.y,
          radius: object.collisionCircle.radius,
        });

        if (collides) {
          gameObjectsManager.despawnObject(object);
          gameObjectsManager.despawnObject(this);
        }
      }
    },
  };
}
