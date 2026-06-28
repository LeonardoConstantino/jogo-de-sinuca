export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const radToDeg = (rad: number): number => {
  return (rad * 180) / Math.PI;
};

export const degToRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};
