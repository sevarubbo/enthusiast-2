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

  return { canvas, onCanvasMouseMove };
}
