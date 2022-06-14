import { createCircle, createTriangle } from "../models";
import type { Circle, Triangle } from "../models";
import type { State } from "../services/state";

const circle = createCircle();
const triangle = createTriangle();

export type StateObject = (
  | Circle
  | Triangle
);

export function createDefaultState(): State<StateObject> {
  return {
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
    },
  };
}
