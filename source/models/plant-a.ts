import { createId } from "helpers";
import {
  type Identifiable,
  type Updatable,
  type Collidable,
  type Healthy,
  createObjectCollisionManager,
  createObjectHealthManager,
  type IntervalManager,
  createIntervalManager,
} from "services/state";

export interface PlantA extends Identifiable, Updatable, Collidable, Healthy {
  type: "plant_a";
  sproutInterval: IntervalManager;
  newGrowth: boolean;
  children: number;
}

export function createPlantA(o: Partial<Pick<PlantA, "x" | "y">> = {}): PlantA {
  return {
    id: createId(),
    type: "plant_a",
    x: o.x || 0,
    y: o.y || 0,
    collisionCircle: { radius: 5 },
    health: createObjectHealthManager({
      maxHealth: 1,
    }),
    collision: createObjectCollisionManager(false),
    sproutInterval: createIntervalManager(700, false),
    newGrowth: true,
    children: 0,

    update(delta, getState) {
      this.health.update(delta, getState, this);
      this.collision.update(delta, getState, this);
      this.sproutInterval.update(delta, getState);

      const MAX_NUMBER_OF_CHILDREN = 5;

      this.sproutInterval.fireIfReady(() => {
        if (!this.newGrowth) {
          this.health.current -= 0.1;

          return;
        }

        const { gameObjectsManager } = getState();

        const plantsWithinRange = Object.values(
          gameObjectsManager.objects,
        ).filter(
          (oo) =>
            oo.type === "plant_a" &&
            Math.sqrt((oo.x - this.x) ** 2 + (oo.y - this.y) ** 2) <
              this.collisionCircle.radius * 3,
        );

        if (plantsWithinRange.length < 4) {
          const spawnLocation = {
            x:
              this.x +
              Math.random() * this.collisionCircle.radius * 5 -
              this.collisionCircle.radius * 2.5,
            y:
              this.y +
              Math.random() * this.collisionCircle.radius * 5 -
              this.collisionCircle.radius * 2.5,
          };

          let collides = false;

          // Check if spawnLocation is within the world
          if (
            spawnLocation.x < 0 ||
            spawnLocation.x > getState().world.size.x ||
            spawnLocation.y < 0 ||
            spawnLocation.y > getState().world.size.y
          ) {
            collides = true;
          }

          // Check if spawnLocation collides with any other objects

          if (!collides) {
            for (const id in gameObjectsManager.objects) {
              const object = gameObjectsManager.getObject(id);

              if ("collisionCircle" in object) {
                const distance = Math.sqrt(
                  (spawnLocation.x - object.x) ** 2 +
                    (spawnLocation.y - object.y) ** 2,
                );

                if (
                  distance <=
                  (this.collisionCircle.radius +
                    object.collisionCircle.radius) *
                    1.1
                ) {
                  collides = true;
                  break;
                }
              }
            }
          }

          if (!collides) {
            gameObjectsManager.spawnObject(createPlantA(spawnLocation));
            this.children += 1;

            if (this.children >= MAX_NUMBER_OF_CHILDREN) {
              this.newGrowth = false;
            }
          }
        } else {
          this.newGrowth = false;
        }
      });
    },
  };
}
