import { Vector2D } from '../utils/vector.utils';

export type BallType = 'cue' | 'solid' | 'striped' | 'eight';

export interface BallData {
  id: string;
  number: number;
  type: BallType;
  color: string;
  stripeColor?: string;
  position: Vector2D;
  isPocketed: boolean;
  scale: number; // For pocketing animation (shrinking)
}

export interface TableData {
  width: number;
  height: number;
  feltColor: string;
  borderColor: string;
  borderWidth: number;
}

export interface PocketData {
  id: string;
  position: Vector2D;
  radius: number;
}
