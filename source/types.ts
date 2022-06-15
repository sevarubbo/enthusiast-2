import type { Circle, Triangle } from "./models";
import type { State } from "./services/state";

export type StateObject = (
  | Circle
  | Triangle
);

export type GameState = State<StateObject>;
