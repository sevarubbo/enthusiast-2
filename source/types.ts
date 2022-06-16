import type { Enemy, Tower } from "./models";

export type StateObject = (
  | Enemy
  | Tower
);
