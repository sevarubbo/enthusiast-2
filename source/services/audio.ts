import { vector } from "./vector";
import type { CameraManager } from "./state";
import type { Vector } from "./vector";

// Define types for audio data
interface AudioData {
  name: string;
  buffer: AudioBuffer;
  baseVolume: number;
}

// Initialize Web Audio API context
const audioContext: AudioContext = new AudioContext();

const audioFiles = [
  {
    name: "basic shot",
    url: "sounds/ESM_MU_FX_foley_cloth_whoosh_organic_basic_small_quick_swoosh_01.wav",
  },
  {
    name: "heavy shot",
    url: "sounds/DS_VUKH_fx_riser_one_shot_fire_inside_short_noise.wav",
  },
  {
    name: "shotgun shot",
    url: "sounds/GunshotRifle_BW.57613.wav",
    baseVolume: 0.9,
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
  {
    name: "shield acquired",
    url: "sounds/ESM_Magic_Game_Shield_Guard_Fantasy_Cast_Craft_Mobile_App_Special_Touch_Pickup.wav",
  },
  {
    name: "shield lost",
    url: "sounds/DS_VP_fx_foley_one_shot_short_glass_shatter.wav",
  },
  {
    name: "egg hatch",
    url: "sounds/LarvaEggHatch_BU01.514.wav",
  },
  {
    name: "no ammo",
    url: "sounds/MouseClick_SFXB.4114.wav",
  },
  {
    name: "weapon pick",
    url: "sounds/ESM_Ancient_Game_Pick_Up_Weapon_Fantasy_Material_Action_Movement_Texture.wav",
  },
  {
    name: "coin chime",
    url: "sounds/ESM_Christmas_Magic_Positive_Award_Chime_1_Dry_Game.wav",
  },
  {
    name: "boss shield hit",
    url: "sounds/ESM_Game_Dark_Item_2_Sci_Fi_Abstract_Tech_Impact_Pick_Up_Alien.wav",
    baseVolume: 3,
  },
  {
    name: "boss shield lost",
    // eslint-disable-next-line max-len
    url: "sounds/ESM_Dirty_Synth_Groan_Item_3_Glitch_Robotic_Technology_Hi_Tech_Futuristic_Game_Tone_Science_UFO_Space_User_Pick_Up_Arcade_Dark.wav",
    baseVolume: 2,
  },
  {
    name: "health critical",
    url: "sounds/ESM_ACV_Vocals_female_pain_tonal_slight_grunt_hit_02.wav",
  },
  {
    name: "boss death",
    url: "sounds/SciFiExplosion_S08SF.306.wav",
    baseVolume: 5,
  },
] as const;

export type SoundName = (typeof audioFiles)[number]["name"];

// Array to store loaded audio data
let loadedAudioData: AudioData[] = [];

let globalVolume = 0.1;

export const setGlobalVolume = (volume: number) => {
  globalVolume = volume;
};

export const getGlobalVolume = () => globalVolume;

// Load audio files and store them in an object
export async function loadAudioFiles(): Promise<void> {
  loadedAudioData = [];

  for (const file of audioFiles) {
    const response = await fetch(file.url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    loadedAudioData.push({
      name: file.name,
      buffer,
      baseVolume: "baseVolume" in file ? file.baseVolume : 1,
    });
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

    gainNode.gain.value = (options.volume ?? 1) * audioData.baseVolume;

    const panNode = audioContext.createStereoPanner();

    panNode.pan.value = options.pan ?? 0;

    source.connect(gainNode).connect(panNode).connect(audioContext.destination);
    source.start(0);
  }
}

export const getSoundPosition = (
  point: Vector,
  cameraManager: CameraManager,
  volume = 1,
) => {
  const objectPosition = vector.create(point.x, point.y);
  const screenPosition = cameraManager.toScreen(objectPosition);

  const distance = vector.distance(
    objectPosition,
    cameraManager.worldTargetPoint,
  );

  // From -1 to 1
  let pan =
    ((screenPosition.x - cameraManager.frame.position.x) /
      cameraManager.frame.size.x) *
      2 -
    1;

  pan = Math.max(-1, Math.min(1, pan));

  return {
    volume: volume * globalVolume * (200 / (distance + 200)),
    pan,
  };
};

export const getSoundProperties = getSoundPosition;
