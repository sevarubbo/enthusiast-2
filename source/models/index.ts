import { createId } from "../helpers";

export interface Identifiable {
  id: string;
}

export interface Drawable {
  drawable: true;
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
    drawable: true,

    update() {
      this.x += 1;
      this.y += 1;
    },
  };
}

// Triangle
interface Triangle extends Identifiable, Drawable, Updatable {
  type: "triangle";
  color: "yellow";
}

export function createTriangle(): Triangle {
  return {
    id: createId(),
    type: "triangle",
    x: 500,
    y: 400,
    color: "yellow",
    radius: 10,
    drawable: true,

    update() {
      this.x -= 1;
      this.y += 1;
    },
  };
}
