export interface Identifiable {
  id: string;
}

export interface Updatable {
  update(): void;
}

export interface State<OT> {
  objects: Record<string, OT | Updatable | Identifiable>;
}
