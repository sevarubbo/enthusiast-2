import { createCircle, createTriangle } from "./models";
import type { Drawable, Identifiable, Updatable } from "./models";

// Create canvas
const canvas = document.createElement("canvas");

// Set canvas resolution
canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;

// Set canvas styles
canvas.style.width = "100%";
canvas.style.height = "100%";

// Add canvas to the DOM
document.body.appendChild(canvas);

// Draw on canvas

// Get canvas context
const canvasContext = canvas.getContext("2d");

if (!canvasContext) {
  throw new Error("Context not found");
}

function draw (ctx: CanvasRenderingContext2D, drawable: Drawable) {
  ctx.beginPath();
  ctx.arc(drawable.x, drawable.y, drawable.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = drawable.color;
  ctx.fill();
  ctx.closePath();
}

interface State {
  objects: Record<string, Updatable | Identifiable>;
}

const circle = createCircle();
const triangle = createTriangle();

const state: State = {
  objects: {
    [circle.id]: circle,
    [triangle.id]: triangle,
  },
};

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
