import { Vector2D, Vector } from '../utils/vector.utils';
import { PocketData } from '../types';

export class Pocket implements PocketData {
  public id: string;
  public position: Vector2D;
  public radius: number;

  constructor(id: string, position: Vector2D, radius: number) {
    this.id = id;
    this.position = { ...position };
    this.radius = radius;
  }

  /**
   * Returns distance from the pocket's center to the ball's center
   */
  public distanceTo(ballPosition: Vector2D): number {
    return Vector.dist(this.position, ballPosition);
  }

  /**
   * Checks if a ball's center is deep enough inside the pocket circle
   */
  public isBallInside(ballPosition: Vector2D, ballRadius: number): boolean {
    const dist = this.distanceTo(ballPosition);
    // The ball is captured if its center is within 1.1x of pocket radius
    return dist < this.radius * 0.95;
  }
}
