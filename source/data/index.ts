import { createCircle, createTriangle } from "../models";
import type { State } from "../services/state";

const circle = createCircle();
const triangle = createTriangle();

export function createDefaultState(): State {
  return {
    objects: {
      [circle.id]: circle,
      [triangle.id]: triangle,
    },
  };
}
