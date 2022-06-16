export interface Vector {
  x: number;
  y: number;
}

export const vector = {
  create(x: number, y: number): Vector {
    return { x, y };
  },
  distance(vector1: Vector, vector2: Vector) {
    return Math.sqrt((vector2.x - vector1.x) ** 2 + (vector2.y - vector1.y) ** 2);
  },
  scale(v: Vector, value: number): Vector {
    return {
      x: v.x * value,
      y: v.y * value,
    };
  },
  add(...vectors: Vector[]): Vector {
    return {
      x: vectors.reduce((s, c) => s + c.x, 0),
      y: vectors.reduce((s, c) => s + c.y, 0),
    };
  },
  subtract(vector1: Vector, vector2: Vector): Vector {
    return {
      x: vector1.x - vector2.x,
      y: vector1.y - vector2.y,
    };
  },
  normalize(v: Vector): Vector {
    const length = vector.distance({ x: 0, y: 0 }, v);

    return vector.scale(v, 1 / length);
  },
  direction(vector1: Vector, vector2: Vector): Vector {
    return vector.normalize(vector.subtract(vector2, vector1));
  },
};
