// Quadtree

import type { StateObject } from "../types";
import type { Collidable } from "./state";
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
  objects: (StateObject & Collidable)[];
  divided: boolean;
  quadrants: Quadtree[];
  subdivide: () => void;
  insert: (point: StateObject & Collidable) => void;
  query: (range: Rectangle, found?: StateObject[]) => StateObject[];
  queryRadius: (point: Vector, radius: number) => StateObject[];
  clear: () => void;
}

export function createQuadtree(
  boundary: Rectangle,
  capacity: number,
): Quadtree {
  const quadtree: Quadtree = {
    boundary,
    capacity,
    objects: [],
    divided: false,
    quadrants: [],
    subdivide: () => subdivide(quadtree),
    insert: (object: StateObject & Collidable) => insert(quadtree, object),
    query: (range: Rectangle) => query(quadtree, range, []),
    queryRadius: (point: Point, radius: number) =>
      queryRadius(quadtree, point, radius),
    clear: () => {
      quadtree.objects = [];
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

export function insert(
  quadtree: Quadtree,
  object: StateObject & Collidable,
): void {
  if (
    !isRectangleIntersecting(quadtree.boundary, object.collision.getRec(object))
  ) {
    return;
  }

  if (quadtree.objects.length < quadtree.capacity) {
    quadtree.objects.push(object);
  } else {
    if (!quadtree.divided) {
      subdivide(quadtree);
    }

    for (const quadrant of quadtree.quadrants) {
      insert(quadrant, object);
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

  for (const object of quadtree.objects) {
    if (isRectangleIntersecting(range, object.collision.getRec(object))) {
      found.push(object);
    }
  }

  if (quadtree.divided) {
    for (const quadrant of quadtree.quadrants) {
      query(quadrant, range, found);
    }
  }

  return found;
}

const queryRadius = (quadtree: Quadtree, point: Point, radius: number) => {
  return query(quadtree, {
    x: point.x - radius,
    y: point.y - radius,
    width: radius * 2,
    height: radius * 2,
  });
};

// function isPointInBoundary(boundary: Rectangle, point: Point): boolean {
//   return (
//     point.x >= boundary.x &&
//     point.x <= boundary.x + boundary.width &&
//     point.y >= boundary.y &&
//     point.y <= boundary.y + boundary.height
//   );
// }

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
