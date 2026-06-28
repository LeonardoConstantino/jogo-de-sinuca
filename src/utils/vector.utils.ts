export interface Vector2D {
  x: number;
  y: number;
}

export const Vector = {
  create: (x = 0, y = 0): Vector2D => ({ x, y }),
  add: (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
  sub: (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
  mult: (v: Vector2D, s: number): Vector2D => ({ x: v.x * s, y: v.y * s }),
  div: (v: Vector2D, s: number): Vector2D => ({ x: s !== 0 ? v.x / s : 0, y: s !== 0 ? v.y / s : 0 }),
  magSq: (v: Vector2D): number => v.x * v.x + v.y * v.y,
  mag: (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y),
  normalize: (v: Vector2D): Vector2D => {
    const m = Math.sqrt(v.x * v.x + v.y * v.y);
    return m > 0 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 };
  },
  dot: (v1: Vector2D, v2: Vector2D): number => v1.x * v2.x + v1.y * v2.y,
  distSq: (v1: Vector2D, v2: Vector2D): number => {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return dx * dx + dy * dy;
  },
  dist: (v1: Vector2D, v2: Vector2D): number => Math.sqrt(Vector.distSq(v1, v2)),
  limit: (v: Vector2D, max: number): Vector2D => {
    const mSq = v.x * v.x + v.y * v.y;
    if (mSq > max * max) {
      const m = Math.sqrt(mSq);
      return { x: (v.x / m) * max, y: (v.y / m) * max };
    }
    return { ...v };
  }
};
