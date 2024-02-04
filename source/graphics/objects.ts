import { drawHealthBar } from "./healthbar";
import { drawCircle } from "services/canvas";
import { vector } from "services/vector";
import type { State } from "services/state";
import type { StateObject } from "types";

function drawObjectAsCircle(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: { radius: number; x: number; y: number; color: string },
) {
  return drawCircle(ctx, {
    position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
    radius: object.radius,
    color: object.color,
  });
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  state: State,
  object: StateObject,
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

  switch (object.type) {
    case "enemy": {
      // Draw next point
      if (object.targetPoint) {
        drawCircle(ctx, {
          position: state.cameraManager.toScreen(object.targetPoint),
          color: "#aaa",
          radius: 2,
        });
      }

      drawCircle(ctx, {
        position: state.cameraManager.toScreen({ x: object.x, y: object.y }),
        ...object,
      });

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
      if (object.isHovered) {
        drawObjectAsCircle(ctx, state, {
          radius: 14,
          x: object.x,
          y: object.y,
          // semitransparent yellow
          color: "rgba(255, 255, 0, 0.5)",
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
      state.cameraManager.isWithinFrame(state.cameraManager.toScreen(object))
    ) {
      drawObject(ctx, state, object);
    }
  }
}
