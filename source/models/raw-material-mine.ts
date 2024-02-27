import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createRawMaterialA } from "./raw-material-a";
import { createIntervalManager, type State } from "services/state";
import type { Vector } from "services/vector";

export const createRawMaterialMine = ({
  position,
  materialType,
}: {
  position: Vector;
  materialType: "A" | "B";
}) => {
  return {
    ...createBaseObject(position),
    type: "raw_material_mine",
    color: materialType === "A" ? "white" : "yellow",
    collision: createObjectCollisionManager({
      circleRadius: 10,
      isSolid: false,
    }),
    spawnInterval: createIntervalManager(4000, true),

    update(delta: number, state: State) {
      this.spawnInterval.update(delta);

      this.spawnInterval.fireIfReady(() => {
        const MAX_RAW_MATERIALS = 20;

        if (
          state.quadtree.queryRadius(this, 100).filter((obj) => {
            return obj.type === "raw_material_a";
          }).length >= MAX_RAW_MATERIALS
        ) {
          return;
        }

        state.gameObjectsManager.spawnObject(
          createRawMaterialA({
            position: {
              x: this.x + Math.random() * 20 - 10,
              y: this.y + Math.random() * 20 - 10,
            },
            materialType,
          }),
        );
      });
    },
  } as const;
};
