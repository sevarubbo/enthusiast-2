export interface StatsManager {
  enemiesDied: number;
  incrementEnemiesDied(): void;
}

export const createStatsManager = (): StatsManager => ({
  enemiesDied: 0,
  incrementEnemiesDied() {
    this.enemiesDied++;
  },
});
