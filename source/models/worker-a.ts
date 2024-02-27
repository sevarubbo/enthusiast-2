import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createObjectMovementManager, type State } from "services/state";
import type { FactoryA } from "./factory-a";
import type { createRawMaterialA, RawMaterialA } from "./raw-material-a";
import type { Vector } from "services/vector";

export const createWorkerA = (position: Vector) => {
  return {
    ...createBaseObject(position),
    type: "worker_a" as const,
    color: "blue",
    collision: createObjectCollisionManager({
      circleRadius: 5,
    }),
    movement: createObjectMovementManager({
      maxSpeed: 0.1,
    }),

    pickedMaterial: null as null | ReturnType<typeof createRawMaterialA>,

    belongsToFactoryId: undefined as undefined | string,

    update(delta: number, state: State) {
      this.movement.update(delta, state, this);

      const belongsToFactory = (
        this.belongsToFactoryId
          ? state.gameObjectsManager.objects[this.belongsToFactoryId]
          : undefined
      ) as FactoryA | undefined;

      // Assign to factory
      (() => {
        if (this.belongsToFactoryId) return;

        const closestFactory = state.gameObjectsManager.findClosestObjectByType(
          this,
          "factory_a",
        );

        this.belongsToFactoryId = closestFactory?.id;
      })();

      // Find raw material
      (() => {
        if (!belongsToFactory) return;
        if (this.pickedMaterial) return;
        if (this.movement.targetPoint) return;

        const materialType =
          belongsToFactory.materials.A < belongsToFactory.materials.B
            ? "A"
            : "B";

        const closestRawMaterial = state.gameObjectsManager.findClosestObject(
          this,
          (obj) =>
            obj.type === "raw_material_a" &&
            obj.materialType === materialType &&
            !obj.isPicked,
        );

        if (closestRawMaterial) {
          this.movement.setTargetPoint(closestRawMaterial);
        }
      })();

      // Pick up raw material
      (() => {
        if (this.pickedMaterial) return;

        const nearbyRawMaterial =
          state.gameObjectsManager.findClosestObject<RawMaterialA>(
            this,
            (obj) => obj.type === "raw_material_a" && !obj.isPicked,
            this.collision.circleRadius,
          );

        if (!nearbyRawMaterial) return;

        this.pickedMaterial = nearbyRawMaterial;
        this.pickedMaterial.isPicked = true;

        this.movement.setTargetPoint(null);
      })();

      // Carry raw material
      (() => {
        if (!this.pickedMaterial) return;

        // Carry in front of worker based on direction
        const carryDistance = 10;
        const carryPosition = {
          x: this.x + Math.cos(this.movement.angle) * carryDistance,
          y: this.y + Math.sin(this.movement.angle) * carryDistance,
        };

        this.pickedMaterial.setPosition(carryPosition);
      })();

      // Go to factory
      (() => {
        if (!belongsToFactory) return;
        if (!this.pickedMaterial) return;
        if (this.movement.targetPoint) return;

        this.movement.setTargetPoint(belongsToFactory);
      })();

      // Drop off raw material
      (() => {
        if (!this.pickedMaterial) return;

        const nearbyFactory =
          state.gameObjectsManager.findClosestObjectByType<FactoryA>(
            this.pickedMaterial,
            "factory_a",
            this.collision.circleRadius,
          );

        if (nearbyFactory !== belongsToFactory) return;

        const materialDropped = nearbyFactory.addMaterial(
          this.pickedMaterial.materialType,
        );

        this.movement.setTargetPoint(null);

        if (materialDropped) {
          state.gameObjectsManager.removeObject(this.pickedMaterial);
          this.pickedMaterial = null;
        }
      })();
    },
  };
};
