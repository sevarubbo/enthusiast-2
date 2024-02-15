import type { Collidable, State } from "./types";
import type { StateObject } from "types";

export interface ObjectCollisionManager {
  collidesWithObjects: Array<StateObject & Collidable>;
  update(delta: number, getState: () => State, object: Collidable): void;
}

export const createObjectCollisionManager = (): ObjectCollisionManager => ({
  collidesWithObjects: [],
  update(delta, getState, object) {
    const state = getState();

    // Remove destroyed objects from the list
    this.collidesWithObjects = this.collidesWithObjects.filter(
      (o) => o.id in state.gameObjectsManager.objects,
    );

    for (const id in state.gameObjectsManager.objects) {
      const otherObject = state.gameObjectsManager.objects[id];

      if (!otherObject || otherObject === object) {
        continue;
      }

      const distance = Math.sqrt(
        (object.x - otherObject.x) ** 2 + (object.y - otherObject.y) ** 2,
      );

      if (
        distance <=
        object.collisionCircle.radius + otherObject.collisionCircle.radius
      ) {
        this.collidesWithObjects.push(otherObject);

        if ("movable" in object) {
          const direction = Math.atan2(
            object.y - otherObject.y,
            object.x - otherObject.x,
          );

          object.x += Math.cos(direction);
          object.y += Math.sin(direction);
        }
      } else {
        this.collidesWithObjects = this.collidesWithObjects.filter(
          (o) => o !== otherObject,
        );
      }
    }
  },
});

// Quadtree
interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Quadtree {
  boundary: Rectangle;
  capacity: number;
  points: Point[];
  divided: boolean;
  quadrants: Quadtree[];
}

function createQuadtree(boundary: Rectangle, capacity: number): Quadtree {
  return {
    boundary,
    capacity,
    points: [],
    divided: false,
    quadrants: [],
  };
}

function subdivide(quadtree: Quadtree): void {
  const { x, y, width, height } = quadtree.boundary;
  const nw: Rectangle = { x, y, width: width / 2, height: height / 2 };
  const ne: Rectangle = {
    x: x + width / 2,
    y,
    width: width / 2,
    height: height / 2,
  };
  const sw: Rectangle = {
    x,
    y: y + height / 2,
    width: width / 2,
    height: height / 2,
  };
  const se: Rectangle = {
    x: x + width / 2,
    y: y + height / 2,
    width: width / 2,
    height: height / 2,
  };

  quadtree.quadrants.push(createQuadtree(nw, quadtree.capacity));
  quadtree.quadrants.push(createQuadtree(ne, quadtree.capacity));
  quadtree.quadrants.push(createQuadtree(sw, quadtree.capacity));
  quadtree.quadrants.push(createQuadtree(se, quadtree.capacity));

  quadtree.divided = true;
}

export function insert(quadtree: Quadtree, point: Point): void {
  if (!isPointInBoundary(quadtree.boundary, point)) {
    return;
  }

  if (quadtree.points.length < quadtree.capacity) {
    quadtree.points.push(point);
  } else {
    if (!quadtree.divided) {
      subdivide(quadtree);
    }

    for (const quadrant of quadtree.quadrants) {
      insert(quadrant, point);
    }
  }
}

export function query(
  quadtree: Quadtree,
  range: Rectangle,
  found: Point[] = [],
): Point[] {
  if (!isRectangleIntersecting(quadtree.boundary, range)) {
    return found;
  }

  for (const point of quadtree.points) {
    if (isPointInBoundary(range, point)) {
      found.push(point);
    }
  }

  if (quadtree.divided) {
    for (const quadrant of quadtree.quadrants) {
      query(quadrant, range, found);
    }
  }

  return found;
}

function isPointInBoundary(boundary: Rectangle, point: Point): boolean {
  return (
    point.x >= boundary.x &&
    point.x <= boundary.x + boundary.width &&
    point.y >= boundary.y &&
    point.y <= boundary.y + boundary.height
  );
}

function isRectangleIntersecting(
  rectangleA: Rectangle,
  rectangleB: Rectangle,
): boolean {
  return (
    rectangleB.x < rectangleA.x + rectangleA.width &&
    rectangleB.x + rectangleB.width > rectangleA.x &&
    rectangleB.y < rectangleA.y + rectangleA.height &&
    rectangleB.y + rectangleB.height > rectangleA.y
  );
}
