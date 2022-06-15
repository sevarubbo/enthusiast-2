import type { StateObject } from "types";

function drawCircle(ctx: CanvasRenderingContext2D, o: { x: number; y: number; radius: number; color: string }) {
  ctx.beginPath();
  ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = o.color;
  ctx.fill();
  ctx.closePath();
}

export function createCanvasDrawer(ctx: CanvasRenderingContext2D) {
  return {
    draw: (object: StateObject) => {
      switch (object.type) {
        case "circle": {
          drawCircle(ctx, object);

          return;
        }

        case "triangle": {
          drawCircle(ctx, object);

          // Draw next point
          if (object.targetPoint) {
            drawCircle(ctx, { x: object.targetPoint.x, y: object.targetPoint.y, color: "#fff", radius: 5 });
          }

          return;
        }
      }
    },
  } as const;
}
