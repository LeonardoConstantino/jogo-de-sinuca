import { Vector2D } from '../utils/vector.utils';

export interface RigidBody {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  radius: number;
  mass: number;
  restitution: number;
  frictionAir: number;
  isStatic: boolean;
}
