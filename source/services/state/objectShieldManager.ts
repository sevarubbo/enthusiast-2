export interface ObjectShieldManager {
  active: boolean;
  hp: number;
  maxHp: number;

  absorbDamage(damage: number): void;
}

export const createObjectShieldManager = ({
  maxHp = 100,
  hp = maxHp,
  active = false,
}: Partial<ObjectShieldManager>): ObjectShieldManager => ({
  active,
  hp,
  maxHp,

  absorbDamage(damage: number) {
    if (this.active) {
      this.hp = Math.max(0, this.hp - damage);

      if (this.hp === 0) {
        this.active = false;
      }
    }
  },
});
