import { Vector2D } from '../utils/vector.utils';
import { BallType, BallData } from '../types';

export class Ball implements BallData {
  public id: string;
  public number: number;
  public type: BallType;
  public color: string;
  public stripeColor?: string;
  public position: Vector2D;
  public velocity: Vector2D;
  public radius: number;
  public mass: number;
  public isPocketed: boolean = false;
  public scale: number = 1.0;

  constructor(
    id: string,
    number: number,
    type: BallType,
    color: string,
    position: Vector2D,
    radius: number,
    stripeColor?: string
  ) {
    this.id = id;
    this.number = number;
    this.type = type;
    this.color = color;
    this.stripeColor = stripeColor || '#ffffff';
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };
    this.radius = radius;
    this.mass = 1.0; // equal mass for all balls ensures natural collisions
  }

  /**
   * Animates pocketing (shrinks ball to 0 before disappearing)
   */
  public updateAnimation(): void {
    if (this.isPocketed && this.scale > 0) {
      this.scale -= 0.08; // shrinks over ~12 frames
      if (this.scale < 0) {
        this.scale = 0;
      }
      // Decelerate quickly inside the pocket
      this.velocity.x *= 0.5;
      this.velocity.y *= 0.5;
    }
  }

  /**
   * Checks if ball is fully stationary
   */
  public get isMoving(): boolean {
    return this.velocity.x !== 0 || this.velocity.y !== 0;
  }
}
