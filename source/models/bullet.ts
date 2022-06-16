import { matrix } from "../services/matrix";
import { createId } from "helpers";
import type { Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

export interface Bullet extends Identifiable, Updatable, Vector {
  type: "bullet";
  color: "yellow";
  radius: 2;
  belongsTo: string;
  speed: 0.2;
  direction: Vector;
}

export function createBullet(o: Pick<Bullet, "x" | "y" | "direction" | "belongsTo">): Bullet {
  return {
    id: createId(),
    type: "bullet",
    color: "yellow",
    radius: 2,
    speed: 0.2,
    ...o,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta, getState) {
      const { world } = getState();

      this.x += this.direction.x * this.speed * delta;
      this.y += this.direction.y * this.speed * delta;
      const worldBox = matrix.create(0, 0, world.size.x, world.size.y);

      if (!matrix.withinBox(this, worldBox)) {
        getState().gameObjectsManager.despawnObject(this);
      }
    },
  };
}
