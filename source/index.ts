import { createDefaultState } from "./data";
import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import { vector } from "./services/vector";
import { loadAudioFiles, setGlobalVolume } from "services/audio";
import {
  setIsPointerDown,
  setKeyPressed,
  setKeyUp,
  setPointerPosition,
} from "services/io";
import type { KeyboardKey } from "services/io";

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

  accumulatedTime += deltaTime;

  if (accumulatedTime < frameTime) {
    requestAnimationFrame((newNow) => gameLoop(ctx, newNow));

    return;
  }

  lastFrameTime = currentTime;
  const delta = deltaTime * state.gameSpeedManager.gameSpeed;

  // console.log(delta);
  draw(state);

  state.gameSpeedManager.update(delta, () => state);
  state.cameraManager.update(delta, () => state);
  state.gameObjectsManager.update(delta, () => state);
  state.collisionManager.update(delta, () => state);

  requestAnimationFrame((newNow) => gameLoop(ctx, newNow));
  accumulatedTime -= frameTime;
};

const startGame = () => {
  // Start game loop
  void loadAudioFiles().then(() => {
    requestAnimationFrame((now) => {
      gameLoop(canvasContext, now);
    });
  });
};

// Export some global stuff
Object.defineProperty(window, "Game", {
  value: {
    vector,
  },
});

// Volume control
const volumeControl = document.createElement("input");

volumeControl.type = "range";
volumeControl.min = "0";
volumeControl.max = "1";
volumeControl.step = "0.01";
volumeControl.value = "0.5";

volumeControl.addEventListener("input", (e) => {
  const value = Number((e.target as HTMLInputElement).value);

  setGlobalVolume(value);
});

volumeControl.style.position = "fixed";
volumeControl.style.top = "230px";
volumeControl.style.left = "10px";

document.body.appendChild(volumeControl);

// Start button
(() => {
  const startButton = document.createElement("button");

  startButton.textContent = "Start";
  startButton.style.position = "fixed";
  // Centered
  startButton.style.top = "50%";
  startButton.style.left = "50%";
  startButton.style.transform = "translate(-50%, -50%)";
  startButton.style.fontSize = "2em";
  startButton.focus();

  startButton.addEventListener("click", () => {
    startGame();

    // Remove button
    startButton.remove();
  });

  document.body.appendChild(startButton);
})();

// Default styles
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "black";
