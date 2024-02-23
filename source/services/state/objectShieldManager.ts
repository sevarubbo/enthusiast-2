import {
  getSoundPosition,
  getSoundProperties,
  playSound,
} from "services/audio";
import type { State } from "./types";
import type { SoundName } from "services/audio";
import type { Vector } from "services/vector";

export const createShield = ({
  maxHp = 30,
  hp = maxHp,
  active = false,
  shieldHitSound = "shield hit",
}: {
  maxHp?: number;
  hp?: number;
  active?: boolean;
  shieldHitSound?: SoundName;
} = {}) => {
  return {
    maxHp,

    get active() {
      return active;
    },

    set active(value: boolean) {
      active = value;
    },

    get hp() {
      return hp;
    },

    set hp(value: number) {
      hp = value;
    },

    absorbDamage(damage: number, shieldOwner: Vector, state: State) {
      if (active) {
        hp = Math.max(0, this.hp - damage);

        if (hp === 0) {
          active = false;

          playSound(
            "shield lost",
            getSoundProperties(shieldOwner, state.cameraManager),
          );
        } else {
          playSound(
            shieldHitSound,
            getSoundPosition(shieldOwner, state.cameraManager),
          );
        }
      }
    },
  } as const;
};

/** @deprecated */
export const createObjectShieldManager = createShield;
