import { createDefaultState } from "./data";
import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import { setKeyPressed, setKeyUp, setPointerPosition } from "./services/io";
import type { KeyboardKey } from "./services/io";

const { canvas, onCanvasMouseMove } = createCanvas();

onCanvasMouseMove((position) => setPointerPosition(position));

// Draw on canvas

// Get canvas context
const canvasContext = canvas.getContext("2d");

if (!canvasContext) {
  throw new Error("Context not found");
}

document.addEventListener("keydown", (e) => {
  setKeyPressed(e.key as KeyboardKey);
  setKeyUp(null);
});

document.addEventListener("keyup", (e) => {
  setKeyPressed(null);
  setKeyUp(e.key as KeyboardKey);
});

// State
const state = createDefaultState();

const { draw } = createCanvasDrawer(canvasContext);

// Game loop
const gameLoop = (ctx: CanvasRenderingContext2D) => {
  state.gameSpeedManager.update(() => state);
  state.cameraManager.update(() => state);

  if (state.gameSpeedManager.gameSpeed > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "#111";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    for (const objectId in state.objects) {
      const object = state.objects[objectId];

      if ("update" in object) {
        object.update(() => state);
      }
    }

    draw(state);
  }

  requestAnimationFrame(() => gameLoop(ctx));
};

requestAnimationFrame(() => gameLoop(canvasContext));
