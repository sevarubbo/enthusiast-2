export interface Identifiable {
  id: string;
}

export interface Updatable {
  update(): void;
}

export interface GameSpeedManager extends Updatable {
  gameSpeed: 0 | 1 | 2;
}

export interface State<OT> {
  gameSpeedManager: GameSpeedManager;
  objects: Record<string, OT>;
}
