// Quadtree

import type { StateObject } from "../types";
import type { Vector } from "./vector";

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
  points: StateObject[];
  divided: boolean;
  quadrants: Quadtree[];
  subdivide: () => void;
  insert: (point: StateObject) => void;
  remove: (point: Vector) => void;
  query: (range: Rectangle, found?: StateObject[]) => StateObject[];
  clear: () => void;
}

export function createQuadtree(
  boundary: Rectangle,
  capacity: number,
): Quadtree {
  const quadtree: Quadtree = {
    boundary,
    capacity,
    points: [],
    divided: false,
    quadrants: [],
    subdivide: () => subdivide(quadtree),
    insert: (point: StateObject) => insert(quadtree, point),
    remove: (point: Point) => remove(quadtree, point),
    query: (range: Rectangle) => query(quadtree, range, []),
    clear: () => {
      quadtree.points = [];
      quadtree.divided = false;
      quadtree.quadrants = [];
    },
  };

  return quadtree;
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

export function insert(quadtree: Quadtree, point: StateObject): void {
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
  found: StateObject[] = [],
): StateObject[] {
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

function remove(quadtree: Quadtree, point: Point | StateObject): void {
  // if (!isPointInBoundary(quadtree.boundary, point)) {
  //   return;
  // }

  const index = quadtree.points.findIndex(
    (p) =>
      (p.x === point.x && p.y === point.y) ||
      ("id" in point && p.id === point.id),
  );

  if (index !== -1) {
    quadtree.points.splice(index, 1);
  } else if (quadtree.divided) {
    for (const quadrant of quadtree.quadrants) {
      remove(quadrant, point);
    }
  }

  if (quadtree.points.length === 0) {
    quadtree.divided = false;
    quadtree.quadrants = [];
  }
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
