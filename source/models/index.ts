import { createId } from "../helpers";

export interface Identifiable {
  id: string;
}

export interface Drawable {
  x: number;
  y: number;
  color: string;
  radius: number;
}

export interface Updatable {
  update(): void;
}

interface Circle extends Identifiable, Drawable, Updatable {
  type: "circle";
}

export function createCircle(): Circle {
  return {
    id: createId(),
    type: "circle",
    x: 300,
    y: 200,
    color: "green",
    radius: 20,

    update() {
      this.x += 1;
      this.y += 1;
    },
  };
}
