import { createBullet } from "./bullet";
import {
  getSoundPosition,
  getSoundProperties,
  playSound,
} from "services/audio";
import { createIntervalManager, type State } from "services/state";
import { vector } from "services/vector";
import type { SoundName } from "services/audio";
import type { Identifiable } from "services/state";
import type { Vector } from "services/vector";

type WeaponType = "default" | "machine_gun_b" | "shotgun";

export const createWeaponA = <T extends WeaponType = "default">({
  bulletSpeed = 1,
  fireRate = 1,
  accuracy = 0.97,
  maxAmmo = 10,
  bulletStrength,
  autoRefillRate = 1,
  type = "default" as T,
  bulletSize,
  shotSound = "basic shot",
  bulletNumber = 1,
}: {
  bulletSpeed?: number;
  fireRate?: number;
  accuracy?: number;
  maxAmmo?: number;
  bulletStrength?: number;
  autoRefillRate?: number;
  type?: T;
  bulletSize?: number;
  shotSound?: SoundName;
  bulletNumber?: number;
} = {}) => {
  let scheduledShoot: { angle: number } | null = null;
  const shootInterval = createIntervalManager(1000 / fireRate);
  const autoRefillInterval = createIntervalManager(
    1000 / autoRefillRate,
    false,
  );
  let ammo = maxAmmo;

  return {
    get ammo() {
      return ammo;
    },
    get maxAmmo() {
      return maxAmmo;
    },

    set ammo(value: number) {
      ammo = value;
    },

    type,

    fireAtAngle: (angle: number) => {
      scheduledShoot = { angle };
    },

    update: (
      delta: number,
      state: State,
      owner: Vector & {
        collision: { circleRadius: number };
      } & Identifiable,
    ) => {
      shootInterval.update(delta);
      autoRefillInterval.update(delta);

      if (scheduledShoot) {
        shootInterval.fireIfReady(() => {
          if (!scheduledShoot) return;

          if (ammo <= 0) {
            playSound(
              "no ammo",
              getSoundProperties(owner, state.cameraManager, 1),
            );

            return;
          }

          ammo -= 1;

          const bulletPosition = {
            x:
              owner.x +
              Math.cos(scheduledShoot.angle) * owner.collision.circleRadius,
            y:
              owner.y +
              Math.sin(scheduledShoot.angle) * owner.collision.circleRadius,
          };

          for (let i = 0; i < bulletNumber; i++) {
            const bulletDirection = vector.fromAngle(
              scheduledShoot.angle + (i - (bulletNumber - 1) / 2) * 0.1,
            );
            // Add some inaccuracy

            bulletDirection.x += (2 * Math.random() - 1) * (2 - 2 * accuracy);
            bulletDirection.y += (2 * Math.random() - 1) * (2 - 2 * accuracy);

            state.gameObjectsManager.spawnObject(
              createBullet({
                ...bulletPosition,
                direction: bulletDirection,
                belongsTo: owner.id,
                speed: bulletSpeed,
                attack: bulletStrength,
                size: bulletSize,
              }),
            );
          }

          // Set the volume depending on camera position
          const { cameraManager } = state;

          playSound(shotSound, getSoundPosition(bulletPosition, cameraManager));
        });
        scheduledShoot = null;
      }

      if (ammo < maxAmmo) {
        autoRefillInterval.fireIfReady(() => {
          ammo += 1;
        });
      }
    },
  } as const;
};

export const createDefaultGun = () => {
  return createWeaponA({
    bulletSpeed: 0.8,
    maxAmmo: 7,
    fireRate: 3,
    autoRefillRate: 0.6,
  });
};

export const createMachineGunB = () => {
  return createWeaponA({
    type: "machine_gun_b",
    bulletSpeed: 0.9,
    maxAmmo: 50,
    fireRate: 11,
    bulletStrength: 1.6,
    accuracy: 0.98,
    autoRefillRate: 0,
  });
};

export const createShotgun = () => {
  return createWeaponA({
    type: "shotgun",
    bulletSpeed: 0.7,
    maxAmmo: 20,
    fireRate: 1.5,
    bulletStrength: 1.5,
    accuracy: 0.91,
    bulletNumber: 10,
    shotSound: "shotgun shot",
    autoRefillRate: 0,
  });
};

export const createSniperRifle = () => {
  return createWeaponA({
    bulletSpeed: 2,
    maxAmmo: 3,
    fireRate: 1,
    accuracy: 0.99,
    bulletStrength: 2,
    autoRefillRate: 0.3,
  });
};
