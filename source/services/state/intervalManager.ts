import type { Updatable } from "./types";

export interface IntervalManager extends Updatable {
  duration: number;
  timeSinceLastFire: number;
  ready: boolean;
  /** @deprecated */
  fire(): void;
  fireIfReady(callback: () => void): void;
}

export const createIntervalManager = (
  duration: number,
  ready = true,
): IntervalManager => ({
  duration,
  timeSinceLastFire: ready ? Infinity : 0,
  ready,

  fire() {
    if (!this.ready) {
      throw new Error("Interval not ready to fire!");
    }

    this.timeSinceLastFire = 0;
  },

  fireIfReady(callback) {
    if (this.ready) {
      callback();
      this.timeSinceLastFire = 0;
    }
  },

  update(delta) {
    this.timeSinceLastFire += delta;
    this.ready = false;

    if (this.timeSinceLastFire > this.duration) {
      this.ready = true;
    }
  },
});
