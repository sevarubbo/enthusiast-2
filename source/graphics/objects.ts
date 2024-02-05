import { drawHealthBar } from "./healthbar";
import { drawCircle, drawCircleOutline } from "services/canvas";
import { vector } from "services/vector";
import type { State } from "services/state";
import type { StateObject } from "types";

function drawObjectAsCircle(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: { radius: number; x: number; y: number; color: string } | StateObject,
) {
  if ("health" in object && object.health.current < object.health.max) {
    const healthBarPosition = vector.add(
      state.cameraManager.toScreen(object),

      (() => {
        if ("radius" in object) {
          return vector.create(0, -object.radius - 10);
        }

        return vector.create(0, -15);
      })(),
    );

    drawHealthBar(
      ctx,
      healthBarPosition,
      object.health.current,
      object.health.max,
    );
  }

  return drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius: "radius" in object ? object.radius : object.collisionCircle.radius,
    color: "color" in object ? object.color : "#fff",
  });
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject,
) {
  // Draw next point
  if ("targetPoint" in object && object.targetPoint) {
    drawCircle(ctx, {
      position: state.cameraManager.toScreen(object.targetPoint),
      color: "#aaa",
      radius: 2,
    });
  }

  switch (object.type) {
    case "enemy": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "tower": {
      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

      const directionPointPosition = vector.scale(
        vector.fromAngle(object.angle),
        10,
      );

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(
          vector.add(object, directionPointPosition),
        ),
        color: "#fff",
        radius: 5,
      });

      return;
    }

    case "bullet": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "house": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "enemyB": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "enemyC": {
      drawObjectAsCircle(ctx, state, object);

      return;
    }

    case "stranger_a": {
      if (object.isSelected) {
        drawCircleOutline(ctx, {
          radius: 16,
          position: state.cameraManager.toScreen(object),
          color: "rgba(255, 255, 255, 0.5)",
          lineWidth: 3,
        });
      } else if (object.isHovered) {
        drawCircleOutline(ctx, {
          radius: 16,
          position: state.cameraManager.toScreen(object),
          color: "rgba(255, 255, 255, 0.3)",
          lineWidth: 2,
        });
      }

      drawObjectAsCircle(ctx, state, {
        radius: 10,
        x: object.x,
        y: object.y,
        color: "#a31c54",
      });

      return;
    }

    case "plant_a": {
      drawObjectAsCircle(ctx, state, {
        radius: object.collisionCircle.radius,
        x: object.x,
        y: object.y,
        color: object.newGrowth ? "#0a0" : "#080",
      });

      return;
    }

    case "plant_eater_a": {
      drawObjectAsCircle(ctx, state, {
        ...object,
        color: "#a00",
      });

      const directionPointPosition = vector.scale(object.movement.direction, 8);

      drawCircle(ctx, {
        position: state.cameraManager.toScreen(
          vector.add(object, directionPointPosition),
        ),
        color: "#000",
        radius: 5,
      });

      return;
    }

    // default: {
    //   drawObjectAsCircle(ctx, state, {
    //     radius: 10,
    //     x: object.x,
    //     y: object.y,
    //     color: "#fff",
    //   });
    // }
  }
}

export function drawObjects(
  ctx: CanvasRenderingContext2D,
  state: State,
  objects: State["gameObjectsManager"]["objects"],
) {
  for (const objectId in objects) {
    const object = objects[objectId];

    if (
      object &&
      state.cameraManager.isWithinFrame(state.cameraManager.toScreen(object))
    ) {
      drawObject(ctx, state, object);
    }
  }
}
