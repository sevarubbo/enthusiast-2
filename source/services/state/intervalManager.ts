export type IntervalManager = ReturnType<typeof createIntervalManager>;

export const createIntervalManager = (duration: number, ready = true) => ({
  duration,
  timeSinceLastFire: ready ? Infinity : 0,
  ready,

  fireIfReady(callback: () => void) {
    if (this.ready) {
      this.timeSinceLastFire = 0;

      callback();
    }
  },

  update(delta: number) {
    this.timeSinceLastFire += delta;
    this.ready = false;

    if (this.timeSinceLastFire > this.duration) {
      this.ready = true;
    }
  },
});
