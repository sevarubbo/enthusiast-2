import { towerUpdate } from "./update";
import { createId } from "helpers";
import type { Collidable, Identifiable, Updatable } from "services/state";
import type { Vector } from "services/vector";

export interface Tower extends Identifiable, Updatable, Vector, Collidable {
  type: "tower";
  color: "green";
  radius: 20;
  shotInterval: IntervalManager;
  angle: number;
  targetEnemyId?: string;
}

interface IntervalManager extends Updatable {
  duration: number;
  timeSinceLastFire: number;
  ready: boolean;
  fire(): void;
}

const createIntervalManager = (duration: number): IntervalManager => ({
  duration,
  timeSinceLastFire: 0,
  ready: false,

  fire() {
    if (!this.ready) {
      throw new Error("Interval not ready to fire!");
    }

    this.timeSinceLastFire = 0;
  },

  update(delta) {
    this.timeSinceLastFire += delta;
    this.ready = false;

    if (this.timeSinceLastFire > this.duration) {
      this.ready = true;
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
    angle: 0,
    collisionCircle: {
      radius: 20,
    },

    update(delta, getState) {
      towerUpdate(this, delta, getState);
    },
  };
}
