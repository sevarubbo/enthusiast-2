import { vector } from "./vector";
import type { CameraManager } from "./state";
import type { StateObject } from "types";

// Define types for audio data
interface AudioData {
  name: string;
  buffer: AudioBuffer;
}

// Initialize Web Audio API context
const audioContext: AudioContext = new AudioContext();

const audioFiles = [
  {
    name: "basic shot",
    url: "sounds/ESM_MU_FX_foley_cloth_whoosh_organic_basic_small_quick_swoosh_01.wav",
  },
  {
    name: "basic death",
    url: "sounds/ESM_Card_Game_Magic_Launch_01_Fantasy_Cast_Spell_Shoot_Poof_Whoosh.wav",
  },
  {
    name: "basic hit",
    url: "sounds/ESM_GF_fx_cobblestone_one_shots_footstep_boots_dry_interior_27.wav",
  },
  {
    name: "shield hit",
    url: "sounds/ShieldHitMetal_BW.58996.wav",
  },
] as const;

export type SoundName = (typeof audioFiles)[number]["name"];

// Array to store loaded audio data
let loadedAudioData: AudioData[] = [];

let globalVolume = 0.5;

export const setGlobalVolume = (volume: number) => {
  globalVolume = volume;
};

// Load audio files and store them in an object
export async function loadAudioFiles(): Promise<void> {
  loadedAudioData = [];

  for (const file of audioFiles) {
    const response = await fetch(file.url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    loadedAudioData.push({ name: file.name, buffer });
  }
}

// Function to play sound by name
export function playSound(
  name: SoundName,
  options: {
    volume?: number;
    pan?: number;
  } = {},
) {
  const audioData = loadedAudioData.find((data) => data.name === name);

  if (audioData) {
    const source = audioContext.createBufferSource();

    source.buffer = audioData.buffer;

    const gainNode = audioContext.createGain();

    gainNode.gain.value = options.volume ?? 1;

    const panNode = audioContext.createStereoPanner();

    panNode.pan.value = options.pan ?? 0;

    source.connect(gainNode).connect(panNode).connect(audioContext.destination);
    source.start(0);
  }
}

export const getSoundPosition = (
  object: StateObject,
  cameraManager: CameraManager,
) => {
  const objectPosition = vector.create(object.x, object.y);
  const screenPosition = cameraManager.toScreen(objectPosition);

  const distance = vector.distance(
    objectPosition,
    cameraManager.worldTargetPoint,
  );

  let pan = screenPosition.x / cameraManager.frame.size.x;

  pan = Math.max(-1, Math.min(1, pan));

  return {
    volume: globalVolume * (200 / (distance + 200)),
    pan,
  };
};
