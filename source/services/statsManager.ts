export const createStatsManager = () => ({
  enemiesDied: 0,
  incrementEnemiesDied() {
    this.enemiesDied++;
  },

  money: 0,
  addMoney(amount: number) {
    this.money += amount;
  },

  strangerDied: false,
  bossDied: false,

  get score() {
    return this.enemiesDied + this.money;
  },
});
