import { Vector2D, Vector } from '../utils/vector.utils';
import { MAX_SHOOT_FORCE, MIN_SHOOT_FORCE, FORCE_MULTIPLIER } from '../config/constants';
import { Ball } from './Ball';

export class CueStick {
  public angle: number = 0; // Aiming angle in radians
  public power: number = 0; // Shot power (0 to 100)
  public isCharging: boolean = false;
  public isActive: boolean = true;

  /**
   * Updates cue stick angle based on mouse position relative to cue ball.
   * Mouse position represents the aiming TARGET.
   */
  public updateAngle(mousePos: Vector2D, cueBallPos: Vector2D): void {
    if (this.isCharging) return; // Lock angle during charging for stable shots
    const dx = mousePos.x - cueBallPos.x;
    const dy = mousePos.y - cueBallPos.y;
    this.angle = Math.atan2(dy, dx);
  }

  /**
   * Sets the current charging power from drag distance
   */
  public setPowerFromDrag(dragDistance: number): void {
    // Map drag distance (0 to 150px) to power (0 to 100)
    const maxDrag = 150;
    const rawPower = (Math.min(dragDistance, maxDrag) / maxDrag) * 100;
    this.power = Math.max(0, rawPower);
  }

  /**
   * Resets stick charging power
   */
  public reset(): void {
    this.power = 0;
    this.isCharging = false;
  }

  /**
   * Computes the actual velocity vector to apply to the cue ball
   */
  public getShotVelocity(): Vector2D {
    // Calculate final force magnitude
    const pct = this.power / 100;
    const forceMag = MIN_SHOOT_FORCE + pct * (MAX_SHOOT_FORCE - MIN_SHOOT_FORCE);
    
    // Shoot in the direction of the aiming angle
    return {
      x: Math.cos(this.angle) * forceMag,
      y: Math.sin(this.angle) * forceMag
    };
  }
}
