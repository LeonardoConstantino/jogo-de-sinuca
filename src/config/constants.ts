export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 400;
export const BOARD_PADDING = 40; // Wood border padding
export const BALL_RADIUS = 11;
export const POCKET_RADIUS = 20;

export const FRICTION_AIR = 0.988; // Drag factor applied per frame
export const STOP_SPEED_THRESHOLD = 0.04; // Speeds below this are treated as 0
export const RESTITUTION_CUSHION = 0.78; // Bounciness of cushions
export const RESTITUTION_BALL = 0.96; // Bounciness of ball-ball collisions

export const MAX_SHOOT_FORCE = 16;
export const MIN_SHOOT_FORCE = 0.5;
export const FORCE_MULTIPLIER = 0.12;

export const COLORS = {
  felt: '#14532d', // Forest Green
  feltBright: '#16a34a', // Bright spotlight green
  border: '#451a03', // Deep wood brown
  borderHighlight: '#78350f', // Light mahogany wood Highlight
  tableOuterShadow: '#111827',
  cueBall: '#fafafa',
  eightBall: '#18181b', // Matte dark grey
  solid: '#dc2626', // Crimson Red
  striped: '#2563eb', // Royal Blue
  cueStick: '#d7ccc8', // Light brown wood
  cueStickTip: '#38bdf8', // Blue chalk tip
  cueStickHandle: '#451a03', // Dark brown wood
  aimGuide: 'rgba(255, 255, 255, 0.4)',
  aimGuideFail: 'rgba(239, 68, 68, 0.5)'
};

export interface BallStaticConfig {
  number: number;
  type: 'solid' | 'striped' | 'eight';
  color: string;
}

export const BALL_CONFIGS: BallStaticConfig[] = [
  { number: 1, type: 'solid', color: '#fbbf24' }, // Yellow
  { number: 2, type: 'solid', color: '#2563eb' }, // Blue
  { number: 3, type: 'solid', color: '#dc2626' }, // Red
  { number: 4, type: 'solid', color: '#7c3aed' }, // Purple
  { number: 5, type: 'solid', color: '#f97316' }, // Orange
  { number: 6, type: 'solid', color: '#16a34a' }, // Green
  { number: 7, type: 'solid', color: '#78350f' }, // Brown
  { number: 8, type: 'eight', color: '#18181b' }, // Black 8
  { number: 9, type: 'striped', color: '#fbbf24' }, // Striped Yellow
  { number: 10, type: 'striped', color: '#2563eb' }, // Striped Blue
  { number: 11, type: 'striped', color: '#dc2626' }, // Striped Red
  { number: 12, type: 'striped', color: '#7c3aed' }, // Striped Purple
  { number: 13, type: 'striped', color: '#f97316' }, // Striped Orange
  { number: 14, type: 'striped', color: '#16a34a' }, // Striped Green
  { number: 15, type: 'striped', color: '#78350f' }  // Striped Brown
];
