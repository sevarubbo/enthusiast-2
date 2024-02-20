import { createMachineGunB } from "./weapon-a";
import { createId } from "helpers";
import {
  type Identifiable,
  type Updatable,
  type Collidable,
  createObjectCollisionManager,
} from "services/state";

export interface WeaponAItem extends Identifiable, Updatable, Collidable {
  id: string;
  type: "weapon_a_item";
  color: "blue";
}

export const createWeaponAItem = (
  o: Pick<WeaponAItem, "x" | "y">,
): WeaponAItem => ({
  id: createId(),
  type: "weapon_a_item",
  color: "blue",
  collisionCircle: { radius: 15 },
  collision: createObjectCollisionManager(),
  x: o.x,
  y: o.y,

  update(delta, getState) {
    this.collision.update(delta, getState, this);
    // If collides with player, give weapon
    const collidesWith = this.collision.collidesWithObjects[0];

    if (collidesWith?.type === "stranger_a") {
      if (
        collidesWith.weapon.type === "default" ||
        collidesWith.weapon.ammo < collidesWith.weapon.maxAmmo
      ) {
        collidesWith.weapon = createMachineGunB();
        getState().gameObjectsManager.despawnObject(this);
      }
    }
  },
});
