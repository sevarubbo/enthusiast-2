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

let lastNow: number;
const MAX_DELTA = 10;

// Game loop
const gameLoop = (ctx: CanvasRenderingContext2D, now: number) => {
  const delta = Math.min(now - lastNow, MAX_DELTA) * state.gameSpeedManager.gameSpeed;

  lastNow = now;

  state.gameSpeedManager.update(delta, () => state);
  state.cameraManager.update(delta, () => state);
  state.gameObjectsManager.update(delta, () => state);

  draw(state);

  requestAnimationFrame((newNow) => gameLoop(ctx, newNow));
};

requestAnimationFrame((now) => {
  lastNow = now;
  gameLoop(canvasContext, now);
});
