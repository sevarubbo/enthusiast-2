import { createBullet } from "./bullet";
import { createId } from "helpers";
import { vector } from "services/vector";
import type { Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

export interface Tower extends Identifiable, Updatable, Vector {
  type: "tower";
  color: "green";
  radius: 20;
  shotInterval: IntervalManager;
}

interface IntervalManager extends Updatable {
  duration: number;
  timeSinceLastFire: number;
  ready: boolean;
}

const createIntervalManager = (duration: number): IntervalManager => ({
  duration,
  timeSinceLastFire: 0,
  ready: false,
  update(delta) {
    this.timeSinceLastFire += delta;
    this.ready = false;

    if (this.timeSinceLastFire > this.duration) {
      this.ready = true;
      this.timeSinceLastFire = 0;
    }
  },
});

export function createTower(o: Partial<Pick<Tower, "x" | "y">> = {}): Tower {
  return {
    id: createId(),
    type: "tower",
    x: o.x || 0,
    y: o.y || 0,
    color: "green",
    radius: 20,
    shotInterval: createIntervalManager(1000),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta, getState) {
      if (this.shotInterval.ready) {
        const bullet = createBullet({
          x: this.x,
          y: this.y,
          direction: vector.normalize(vector.create(-1 + Math.random() * 2, -1 + Math.random() * 2)),
          belongsTo: this.id,
        });

        getState().gameObjectsManager.spawnObject(bullet);
      }

      this.shotInterval.update(delta, getState);
    },
  };
}
