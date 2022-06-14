import { createDefaultState } from "./data";
import { createCanvas } from "./services/canvas";
import { setPointerPosition } from "./services/io";
import type { Drawable } from "./services/state";

const { canvas, onCanvasMouseMove } = createCanvas();

onCanvasMouseMove((position) => setPointerPosition(position));

// Draw on canvas

// Get canvas context
const canvasContext = canvas.getContext("2d");

if (!canvasContext) {
  throw new Error("Context not found");
}

// Drawer
function draw (ctx: CanvasRenderingContext2D, drawable: Drawable) {
  ctx.beginPath();
  ctx.arc(drawable.x, drawable.y, drawable.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = drawable.color;
  ctx.fill();
  ctx.closePath();
}

// State
const state = createDefaultState();

// Game loop
const gameLoop = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvasContext.fillStyle = "#111";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  for (const objectId in state.objects) {
    const object = state.objects[objectId];

    if ("update" in object) {
      object.update();
    }

    if ("drawable" in object) {
      draw(canvasContext, object);
    }
  }

  requestAnimationFrame(() => gameLoop(ctx));
};

requestAnimationFrame(() => gameLoop(canvasContext));
