import { createDefaultState } from "./data";
import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import {
  setIsPointerDown,
  setKeyPressed,
  setKeyUp,
  setPointerPosition,
} from "./services/io";
import { vector } from "./services/vector";
import { loadAudioFiles } from "services/audio";
import type { KeyboardKey } from "./services/io";

const { canvas, onCanvasMouseMove, onPointerDown, onPointerUp } =
  createCanvas();

onCanvasMouseMove((position) => setPointerPosition(position));
onPointerDown(() => setIsPointerDown(true));
onPointerUp(() => setIsPointerDown(false));

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

const targetFPS = 60; // Target FPS for rendering
const frameTime = 1000 / targetFPS; // Desired frame time in milliseconds

let lastFrameTime = performance.now();
let accumulatedTime = 0;

// Game loop
const gameLoop = (ctx: CanvasRenderingContext2D, currentTime: number) => {
  const deltaTime = currentTime - lastFrameTime;

  lastFrameTime = currentTime;
  accumulatedTime += deltaTime;

  if (accumulatedTime < frameTime) {
    requestAnimationFrame((newNow) => gameLoop(ctx, newNow));

    return;
  }

  const delta = deltaTime * state.gameSpeedManager.gameSpeed;

  // console.log(delta);

  state.gameSpeedManager.update(delta, () => state);

  state.cameraManager.update(delta, () => state);

  state.gameObjectsManager.update(delta, () => state);

  draw(state);

  requestAnimationFrame((newNow) => gameLoop(ctx, newNow));
  accumulatedTime -= frameTime;
};

// Start game loop
void loadAudioFiles().then(() => {
  requestAnimationFrame((now) => {
    gameLoop(canvasContext, now);
  });
});

// Export some global stuff
Object.defineProperty(window, "Game", {
  value: {
    vector,
  },
});
