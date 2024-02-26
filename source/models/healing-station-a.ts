import { createBaseObject } from "./helpers";
import { createItemShotgun } from "./item-shotgun";
import { createObjectCollisionManager } from "./managers";
import { createShieldItem } from "./shield-item";
import { createWeaponAItem } from "./weapon-a-item";
import { createIntervalManager } from "../services/state";
import type { State } from "../services/state";
import type { Vector } from "../services/vector";

const HEAL_AMOUNT = 2;

export const createHealingStationA = (position: Vector) => {
  let color = "#030";

  return {
    ...createBaseObject(position),
    type: "healing_station_a",

    collisionCircle: { radius: 150 },
    collision: createObjectCollisionManager({
      circleRadius: 100,
      isSolid: false,
    }),
    healInterval: createIntervalManager(250),
    itemSpawnInterval: createIntervalManager(10000),

    get color() {
      return color;
    },
    setColor(c: string) {
      color = c;
    },

    update(delta: number, state: State) {
      this.healInterval.update(delta);

      const collidingObjects = this.collision.collidesWithObjects.filter(
        (o) => "health" in o && o.health.current < o.health.max,
      );

      if (collidingObjects.find((o) => "health" in o)) {
        this.setColor("#080");
      } else {
        this.setColor("#030");
      }

      this.healInterval.fireIfReady(() => {
        for (const object of collidingObjects) {
          if ("health" in object) {
            object.health.increase(HEAL_AMOUNT / collidingObjects.length);
          }
        }
      });

      this.itemSpawnInterval.update(delta);
      this.itemSpawnInterval.fireIfReady(() => {
        const shieldItems =
          state.gameObjectsManager.findObjectsByType("shield_item");
        const weaponAItems =
          state.gameObjectsManager.findObjectsByType("weapon_a_item");
        const shotgunItems =
          state.gameObjectsManager.findObjectsByType("item_shotgun");

        if (!shieldItems.length) {
          state.gameObjectsManager.spawnObject(createShieldItem(this));
        }

        if (!weaponAItems.length && !shotgunItems.length) {
          if (Math.random() < 0.5) {
            state.gameObjectsManager.spawnObject(createWeaponAItem(this));
          } else {
            state.gameObjectsManager.spawnObject(createItemShotgun(this));
          }
        }
      });
    },
  } as const;
};
