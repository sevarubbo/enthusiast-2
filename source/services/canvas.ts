import type { Vector } from "./vector";

export function createCanvas() {
  const canvas = document.createElement("canvas");

  // Set canvas resolution
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;

  // Set canvas styles
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  // Add canvas to the DOM
  document.body.appendChild(canvas);

  const onCanvasMouseMove = (callback: (position: Vector) => void) => {
    canvas.addEventListener("mousemove", (event) => {
      callback({ x: event.x, y: event.y });
    });
  };

  const onPointerDown = (callback: () => void) => {
    canvas.addEventListener("mousedown", () => {
      callback();
    });
  };

  const onPointerUp = (callback: () => void) => {
    canvas.addEventListener("mouseup", () => {
      callback();
    });
  };

  return { canvas, onCanvasMouseMove, onPointerDown, onPointerUp };
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  o: { position: Vector; radius: number; color: string },
) {
  ctx.beginPath();
  ctx.arc(o.position.x, o.position.y, o.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = o.color;

  ctx.fill();
  ctx.closePath();
}
