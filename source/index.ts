import { createDefaultState } from "./data";
import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import { setPointerPosition } from "./services/io";

const { canvas, onCanvasMouseMove } = createCanvas();

onCanvasMouseMove((position) => setPointerPosition(position));

// Draw on canvas

// Get canvas context
const canvasContext = canvas.getContext("2d");

if (!canvasContext) {
  throw new Error("Context not found");
}

// State
const state = createDefaultState();

const { draw } = createCanvasDrawer(canvasContext);

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

    if ("type" in object) {
      draw(object);
    }
  }

  requestAnimationFrame(() => gameLoop(ctx));
};

requestAnimationFrame(() => gameLoop(canvasContext));
