import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import { vector } from "./services/vector";
import { createWorldA } from "data/world-a";
import { createWorldB } from "data/world-b";
import { createWorldC } from "data/world-c";
import {
  getGlobalVolume,
  loadAudioFiles,
  setGlobalVolume,
} from "services/audio";
import {
  setIsPointerDown,
  setKeyPressed,
  setKeyUp,
  setPointerPosition,
} from "services/io";
import type { KeyboardKey } from "services/io";
import type { State } from "services/state";

const { canvas, onCanvasMouseMove, onPointerDown, onPointerUp, fitToScreen } =
  createCanvas();

onCanvasMouseMove((position) => setPointerPosition(position));
onPointerDown(() => setIsPointerDown(true));
onPointerUp(() => setIsPointerDown(false));

// Prevent context menu
(() => {
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
})();

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
let state: State;

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

  state.gameSpeedManager.update(delta, state);
  state.cameraManager.update(delta, state);
  state.gameObjectsManager.update(delta, state);
  state.collisionManager.update(delta, state);

  requestAnimationFrame((newNow) => gameLoop(ctx, newNow));
  accumulatedTime -= frameTime;
};

const startGame = (initialState: State) => {
  state = initialState;

  // Start game loop
  void loadAudioFiles().then(() => {
    requestAnimationFrame((now) => {
      gameLoop(canvasContext, now);
    });
  });
};

// Export some global stuff (for debugging)
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
volumeControl.value = getGlobalVolume().toString();

volumeControl.style.position = "fixed";
volumeControl.style.top = "230px";
volumeControl.style.left = "10px";

volumeControl.addEventListener("input", (e) => {
  const value = Number((e.target as HTMLInputElement).value);

  setGlobalVolume(value);
});

document.body.appendChild(volumeControl);

// Start buttons
(() => {
  const startButtons = document.createElement("div");

  startButtons.style.position = "fixed";
  startButtons.style.top = "50%";
  startButtons.style.left = "50%";
  startButtons.style.transform = "translate(-50%, -50%)";
  startButtons.style.display = "flex";
  startButtons.style.gap = "20px";

  [() => createWorldA(), () => createWorldB(), () => createWorldC()].forEach(
    (createWorld, index) => {
      const button = document.createElement("button");

      button.textContent = `World ${index + 1}`;
      button.style.fontSize = "24px";

      button.addEventListener("click", () => {
        startGame(createWorld());

        startButtons.remove();
      });

      startButtons.appendChild(button);
    },
  );

  document.body.appendChild(startButtons);
})();

// Default styles
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "black";

// Resize canvas on window resize
(() => {
  window.addEventListener("resize", () => {
    state.cameraManager.frame.size = vector.create(canvas.width, canvas.height);
    fitToScreen();
  });
  fitToScreen();
})();
