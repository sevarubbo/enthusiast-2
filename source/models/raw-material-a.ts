import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import type { Vector } from "services/vector";

export type RawMaterialA = ReturnType<typeof createRawMaterialA>;

export const createRawMaterialA = ({
  position,
  materialType,
}: {
  position: Vector;
  materialType: "A" | "B";
}) => {
  return {
    ...createBaseObject(position),
    type: "raw_material_a" as const,
    materialType,
    color: materialType === "A" ? "brown" : "orange",
    isPicked: false,
    collision: createObjectCollisionManager({
      circleRadius: 5,
    }),
  };
};
