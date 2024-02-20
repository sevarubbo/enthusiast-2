import { createBullet } from "./bullet";
import {
  getSoundPosition,
  getSoundProperties,
  playSound,
} from "services/audio";
import { createIntervalManager, type State } from "services/state";
import { vector } from "services/vector";
import type { StateObject } from "types";

export const createWeaponA = <T extends string = "default">({
  bulletSpeed = 1,
  fireRate = 1,
  accuracy = 0.97,
  maxAmmo = 10,
  bulletStrength,
  autoRefillRate = 1,
  type = "default" as T,
}: {
  bulletSpeed?: number;
  fireRate?: number;
  accuracy?: number;
  maxAmmo?: number;
  bulletStrength?: number;
  autoRefillRate?: number;
  type?: T;
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

    type,

    fireAtAngle: (angle: number) => {
      scheduledShoot = { angle };
    },

    update: (delta: number, getState: () => State, owner: StateObject) => {
      shootInterval.update(delta, getState);
      autoRefillInterval.update(delta, getState);

      if (scheduledShoot) {
        shootInterval.fireIfReady(() => {
          if (!scheduledShoot) return;

          if (ammo <= 0) {
            playSound(
              "no ammo",
              getSoundProperties(owner, getState().cameraManager, 1),
            );

            return;
          }

          ammo -= 1;

          const bulletPosition = {
            x:
              owner.x +
              Math.cos(scheduledShoot.angle) * owner.collisionCircle.radius,
            y:
              owner.y +
              Math.sin(scheduledShoot.angle) * owner.collisionCircle.radius,
          };

          const bulletDirection = vector.fromAngle(scheduledShoot.angle);

          // Add some inaccuracy
          bulletDirection.x += (2 * Math.random() - 1) * (2 - 2 * accuracy);
          bulletDirection.y += (2 * Math.random() - 1) * (2 - 2 * accuracy);

          getState().gameObjectsManager.spawnObject(
            createBullet({
              ...bulletPosition,
              direction: bulletDirection,
              belongsTo: owner.id,
              speed: bulletSpeed,
              attack: bulletStrength,
            }),
          );

          // Set the volume depending on camera position
          const { cameraManager } = getState();

          playSound(
            "basic shot",
            getSoundPosition(bulletPosition, cameraManager),
          );
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

export const createMachineGun = () => {
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
    fireRate: 12,
    bulletStrength: 2,
    accuracy: 0.98,
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
