import { createDefaultState } from "./data";
import { createCanvasDrawer } from "./graphics";
import { createCanvas } from "./services/canvas";
import { vector } from "./services/vector";
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

  [
    () => createDefaultState(),
    () => createWorldB(),
    () => createWorldC(),
  ].forEach((createWorld, index) => {
    const button = document.createElement("button");

    button.textContent = `World ${index + 1}`;
    button.style.fontSize = "24px";

    button.addEventListener("click", () => {
      startGame(createWorld());

      startButtons.remove();
    });

    startButtons.appendChild(button);
  });

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

// Soundcloud widget
(() => {
  const widget = document.createElement("iframe");

  // import sc api script
  const script = document.createElement("script");

  script.src = "https://w.soundcloud.com/player/api.js";
  document.body.appendChild(script);

  widget.src =
    // eslint-disable-next-line max-len
    "https://w.soundcloud.com/player/?url=https://soundcloud.com/land_scap3/sets/8026oo&color=%23000000&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false";
  widget.width = "100%";
  widget.height = "100px";
  widget.style.position = "fixed";
  widget.style.left = "0";
  widget.style.border = "none";
  widget.allow = "autoplay";
  widget.style.display = "none";

  document.body.appendChild(widget);

  setTimeout(() => {
    // eslint-disable-next-line
    const SC = (window as any).SC;

    const setup = () => {
      // eslint-disable-next-line
      const w = SC.Widget(widget);

      // set volume
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      w.setVolume(10);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      w.skip(Math.floor(Math.random() * 61));

      window.removeEventListener("click", setup);
    };

    window.addEventListener("click", setup);
  }, 1000);
})();
