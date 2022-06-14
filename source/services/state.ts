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

export interface State {
  objects: Record<string, Updatable | Identifiable>;
}
