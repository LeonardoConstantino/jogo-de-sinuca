import { Vector, Vector2D } from '../utils/vector.utils';
import { FRICTION_AIR, STOP_SPEED_THRESHOLD, RESTITUTION_CUSHION, RESTITUTION_BALL } from '../config/constants';

export interface PhysicalBall {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  mass: number;
  isPocketed: boolean;
  scale: number;
  type: string;
}

export class PhysicsEngine {
  /**
   * Updates physical states (friction, velocity, position, bounds) of all balls
   */
  public update(
    balls: PhysicalBall[],
    tableWidth: number,
    tableHeight: number,
    onCollision?: (a: PhysicalBall, b: PhysicalBall) => void
  ): void {
    const activeBalls = balls.filter(b => !b.isPocketed);

    // 1. Move balls and apply table friction
    for (const ball of activeBalls) {
      // Apply linear rolling resistance
      ball.velocity = Vector.mult(ball.velocity, FRICTION_AIR);

      // Stop entirely if moving below threshold (prevent infinite tiny movements)
      if (Vector.magSq(ball.velocity) < STOP_SPEED_THRESHOLD * STOP_SPEED_THRESHOLD) {
        ball.velocity = Vector.create(0, 0);
      }

      // Update position
      ball.position = Vector.add(ball.position, ball.velocity);

      // 2. Resolve cushion boundaries (bounce off rails)
      this.resolveCushions(ball, tableWidth, tableHeight);
    }

    // 3. Resolve ball-to-ball elastic collisions
    this.resolveBallCollisions(activeBalls, onCollision);
  }

  /**
   * Bounces the ball off cushion rails with restitution
   */
  private resolveCushions(ball: PhysicalBall, width: number, height: number): void {
    const left = ball.radius;
    const right = width - ball.radius;
    const top = ball.radius;
    const bottom = height - ball.radius;

    // Horizonal rebounds (left and right rails)
    if (ball.position.x < left) {
      ball.position.x = left;
      if (ball.velocity.x < 0) {
        ball.velocity.x = -ball.velocity.x * RESTITUTION_CUSHION;
      }
    } else if (ball.position.x > right) {
      ball.position.x = right;
      if (ball.velocity.x > 0) {
        ball.velocity.x = -ball.velocity.x * RESTITUTION_CUSHION;
      }
    }

    // Vertical rebounds (top and bottom rails)
    if (ball.position.y < top) {
      ball.position.y = top;
      if (ball.velocity.y < 0) {
        ball.velocity.y = -ball.velocity.y * RESTITUTION_CUSHION;
      }
    } else if (ball.position.y > bottom) {
      ball.position.y = bottom;
      if (ball.velocity.y > 0) {
        ball.velocity.y = -ball.velocity.y * RESTITUTION_CUSHION;
      }
    }
  }

  /**
   * Performs circle-circle elastic collision checks and resolves impulses + positions
   */
  private resolveBallCollisions(
    balls: PhysicalBall[],
    onCollision?: (a: PhysicalBall, b: PhysicalBall) => void
  ): void {
    const len = balls.length;

    // Multiple passes (usually 2-3) of collision resolution ensures stability in stacks/clusters
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < len; i++) {
        const ballA = balls[i];
        for (let j = i + 1; j < len; j++) {
          const ballB = balls[j];

          const dist = Vector.dist(ballA.position, ballB.position);
          const minDist = ballA.radius + ballB.radius;

          if (dist < minDist) {
            // Overlap detected!
            
            // 1. Positional correction (resolve overlap to prevent clipping)
            const normal = dist > 0 
              ? Vector.normalize(Vector.sub(ballB.position, ballA.position))
              : Vector.create(1, 0); // fallback for perfect overlap

            const overlap = minDist - dist;
            const separation = Vector.mult(normal, overlap * 0.51); // slightly more than 50% to prevent re-collision
            
            ballA.position = Vector.sub(ballA.position, separation);
            ballB.position = Vector.add(ballB.position, separation);

            // 2. Elastic collision response (impulse calculation)
            const relVel = Vector.sub(ballB.velocity, ballA.velocity);
            const velAlongNormal = Vector.dot(relVel, normal);

            // Only resolve if they are moving towards each other
            if (velAlongNormal < 0) {
              const restitution = RESTITUTION_BALL;
              
              // Impulse scalar
              const impulseScalar = -(1 + restitution) * velAlongNormal / (1 / ballA.mass + 1 / ballB.mass);

              // Apply impulse vector
              const impulseVec = Vector.mult(normal, impulseScalar);
              
              ballA.velocity = Vector.sub(ballA.velocity, Vector.mult(impulseVec, 1 / ballA.mass));
              ballB.velocity = Vector.add(ballB.velocity, Vector.mult(impulseVec, 1 / ballB.mass));

              // Trigger collision callback
              if (onCollision && pass === 0) {
                onCollision(ballA, ballB);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Helper to verify if all balls are currently stationary
   */
  public areAllBallsStopped(balls: PhysicalBall[]): boolean {
    return balls
      .filter(b => !b.isPocketed)
      .every(b => b.velocity.x === 0 && b.velocity.y === 0);
  }
}
