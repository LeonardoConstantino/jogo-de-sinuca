import { Vector, Vector2D } from '../utils/vector.utils';
import { GameState, BallType } from '../types';
import { PhysicsEngine, PhysicalBall } from './PhysicsEngine';
import { Renderer } from './Renderer';
import { Table } from '../entities/Table';
import { Ball } from '../entities/Ball';
import { CueStick } from '../entities/CueStick';
import { InputController } from '../managers/InputController';
import { GameStateManager } from '../managers/GameStateManager';
import { CollisionManager } from '../managers/CollisionManager';
import { BALL_RADIUS, TABLE_WIDTH, TABLE_HEIGHT, COLORS, BALL_CONFIGS } from '../config/constants';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private physics: PhysicsEngine;
  
  public table: Table;
  public balls: Ball[] = [];
  public cueBall!: Ball;
  public cueStick: CueStick;
  public input: InputController;
  public stateManager: GameStateManager;
  public collision: CollisionManager;

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  
  // Scratched ball flag (respawn triggers after balls stop rolling)
  private hasScratchedThisTurn: boolean = false;

  // React state trigger callback
  private onStateChangeCallback: () => void = () => {};

  constructor(canvas: HTMLCanvasElement, onStateChange?: () => void) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.physics = new PhysicsEngine();
    
    this.table = new Table();
    this.cueStick = new CueStick();
    this.input = new InputController(canvas);
    this.stateManager = new GameStateManager();
    this.collision = new CollisionManager();

    if (onStateChange) {
      this.onStateChangeCallback = onStateChange;
    }

    this.initGame();
    this.setupInputHandlers();
    this.startLoop();
  }

  /**
   * Spawns all balls and places them in standard racking format
   */
  private initGame(): void {
    this.balls = [];
    this.hasScratchedThisTurn = false;

    // 1. Spawn Cue Ball (starting in the Headstring area)
    const cueBallStartPos = { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT * 0.5 };
    this.cueBall = new Ball(
      'ball-cue',
      0,
      'cue',
      COLORS.cueBall,
      cueBallStartPos,
      BALL_RADIUS
    );
    this.balls.push(this.cueBall);

    // 2. Spawn and rack the 15 object balls in a perfect pyramid on the right
    this.rackBalls();

    // 3. Reset managers
    this.stateManager.reset();
    this.cueStick.reset();
    this.cueStick.isActive = true;
    this.onStateChangeCallback();
  }

  /**
   * Arranges the 15 object balls into a rigid triangular rack on the right spot
   */
  private rackBalls(): void {
    const startX = TABLE_WIDTH * 0.73; // Apex starting position
    const startY = TABLE_HEIGHT * 0.5;
    
    // Rows spacing formula: tight packing of circles
    const dx = BALL_RADIUS * 1.732; // sqrt(3) spacing
    const dy = BALL_RADIUS;

    // A predefined rack configuration mapping the 15 balls to standard rows.
    // Row 1 (Apex): 1-ball (Yellow Solid)
    // Row 2: One solid, one striped
    // Row 3: 8-Ball is ALWAYS in the center! Other slots are solid and striped.
    // Row 5: Outer corners are split solid/striped.
    const rackPositions: { row: number; col: number; ballIndex: number }[] = [
      { row: 0, col: 0, ballIndex: 0 },  // Row 1 (Apex) -> Ball 1
      
      { row: 1, col: -1, ballIndex: 1 }, // Row 2 -> Ball 2 (Solid)
      { row: 1, col: 1, ballIndex: 8 },  // Row 2 -> Ball 9 (Striped)

      { row: 2, col: -2, ballIndex: 9 }, // Row 3 -> Ball 10 (Striped)
      { row: 2, col: 0, ballIndex: 7 },  // Row 3 -> Ball 8 (8-Ball, ALWAYS CENTER!)
      { row: 2, col: 2, ballIndex: 2 },  // Row 3 -> Ball 3 (Solid)

      { row: 3, col: -3, ballIndex: 10 },// Row 4 -> Ball 11 (Striped)
      { row: 3, col: -1, ballIndex: 3 }, // Row 4 -> Ball 4 (Solid)
      { row: 3, col: 1, ballIndex: 11 }, // Row 4 -> Ball 12 (Striped)
      { row: 3, col: 3, ballIndex: 4 },  // Row 4 -> Ball 5 (Solid)

      { row: 4, col: -4, ballIndex: 12 },// Row 5 -> Ball 13 (Striped)
      { row: 4, col: -2, ballIndex: 5 }, // Row 5 -> Ball 6 (Solid)
      { row: 4, col: 0, ballIndex: 13 }, // Row 5 -> Ball 14 (Striped)
      { row: 4, col: 2, ballIndex: 6 },  // Row 5 -> Ball 7 (Solid)
      { row: 4, col: 4, ballIndex: 14 }  // Row 5 -> Ball 15 (Striped)
    ];

    for (const pos of rackPositions) {
      const config = BALL_CONFIGS[pos.ballIndex];
      
      // Calculate row displacement
      const x = startX + pos.row * dx;
      // Calculate vertical offset (cols are offset by dy * 2 per level)
      const y = startY + pos.col * dy;

      const ball = new Ball(
        `ball-${config.number}`,
        config.number,
        config.type as BallType,
        config.color,
        { x, y },
        BALL_RADIUS
      );

      this.balls.push(ball);
    }
  }

  /**
   * Connects the InputController events with the game actions
   */
  private setupInputHandlers(): void {
    // 1. Aim move (mouse or touch motion on canvas)
    this.input.onAimMove = (mousePos) => {
      if (this.stateManager.currentState === GameState.AIMING) {
        this.cueStick.updateAngle(mousePos, this.cueBall.position);
      }
    };

    // 2. Click down and drag back triggers power charging
    this.input.onShoot = (dragDist) => {
      const state = this.stateManager.currentState;
      if (state === GameState.AIMING || state === GameState.CHARGING) {
        this.cueStick.setPowerFromDrag(dragDist);
        
        // Only shoot if pulled back at least some minimum distance
        if (this.cueStick.power > 2) {
          this.stateManager.changeState(GameState.SHOOTING);
          this.onStateChangeCallback();
        } else {
          // Re-lock aiming if click was a tiny tap
          this.stateManager.changeState(GameState.AIMING);
          this.cueStick.reset();
        }
      }
    };
  }

  /**
   * Master loop of the game, executing 60 times per second
   */
  private startLoop(): void {
    const loop = () => {
      if (this.isDestroyed) return;

      this.update();
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Core logic updates per frame
   */
  private update(): void {
    const state = this.stateManager.currentState;

    // Handle Input dragging state
    if (this.input.isMouseDown && state === GameState.AIMING) {
      this.stateManager.changeState(GameState.CHARGING);
      this.cueStick.isCharging = true;
      this.onStateChangeCallback();
    }

    if (this.cueStick.isCharging && this.input.isMouseDown) {
      this.cueStick.setPowerFromDrag(this.input.dragDistance);
    }

    // 1. Execute Shot physics trigger
    if (state === GameState.SHOOTING) {
      const impulse = this.cueStick.getShotVelocity();
      this.cueBall.velocity = impulse;
      
      this.stateManager.recordShot();
      this.stateManager.changeState(GameState.BALLS_MOVING);
      
      this.cueStick.reset();
      this.cueStick.isActive = false; // Hide cue stick during rolling
      this.onStateChangeCallback();
    }

    // 2. Physics step (only active when balls are moving)
    if (state === GameState.BALLS_MOVING) {
      // Step Physics
      this.physics.update(
        this.balls,
        TABLE_WIDTH,
        TABLE_HEIGHT,
        (ballA, ballB) => {
          // Collision sound callback
          const relVel = Vector.sub(ballB.velocity, ballA.velocity);
          const mag = Vector.mag(relVel);
          this.collision.playBallCollisionSound(mag);
        }
      );

      // Check ball-to-pocket captures
      this.checkPockets();

      // Check rolling cessation
      if (this.physics.areAllBallsStopped(this.balls)) {
        this.handleBallsStopped();
      }
    }

    // Update pocketing shrink scale animations
    for (const ball of this.balls) {
      ball.updateAnimation();
    }
  }

  /**
   * Checks if rolling balls overlap deep enough with the 6 pocket circles
   */
  private checkPockets(): void {
    const activeBalls = this.balls.filter(b => !b.isPocketed);

    for (const ball of activeBalls) {
      for (const pocket of this.table.pockets) {
        if (pocket.isBallInside(ball.position, ball.radius)) {
          // Ball fell in!
          ball.isPocketed = true;
          this.collision.playPocketSunkSound();

          if (ball.type === 'cue') {
            // Scratch!
            this.hasScratchedThisTurn = true;
            this.stateManager.recordScratch();
            this.onStateChangeCallback();
          } else if (ball.type === 'eight') {
            // 8-Ball pocketed rules!
            const otherActiveBalls = this.balls.filter(
              b => b.type !== 'cue' && b.type !== 'eight' && !b.isPocketed
            );
            
            if (otherActiveBalls.length > 0) {
              // Pocketed 8-ball too early -> Defeat!
              this.stateManager.setDefeat();
            } else {
              // Sunk 8-ball last -> Victory!
              this.stateManager.setVictory();
            }
            this.onStateChangeCallback();
          } else {
            // Object ball sunk
            this.stateManager.recordSunkBall(ball.type);
            this.onStateChangeCallback();
          }
        }
      }
    }
  }

  /**
   * Runs exactly once when rolling physics ceases
   */
  private handleBallsStopped(): void {
    if (this.stateManager.currentState === GameState.GAME_OVER) return;

    // 1. Resolve Scratch respawn if cue ball was pocketed
    if (this.hasScratchedThisTurn) {
      this.respawnCueBall();
      this.hasScratchedThisTurn = false;
    }

    // 2. Check if table is empty (except for cue/eight)
    const remainingObjectBalls = this.balls.filter(
      b => b.type !== 'cue' && b.type !== 'eight' && !b.isPocketed
    );

    if (remainingObjectBalls.length === 0) {
      this.stateManager.gameMessage = '🎉 Mesa limpa! Agora mire e encaçape a bola 8 preta para vencer!';
    }

    // 3. Turn completes, return control to player aiming
    this.stateManager.changeState(GameState.AIMING);
    this.cueStick.isActive = true;
    this.cueStick.reset();
    
    // Re-orient cue stick towards the mouse
    this.cueStick.updateAngle(this.input.mousePosition, this.cueBall.position);
    this.onStateChangeCallback();
  }

  /**
   * Resets the Cue Ball at starting headstring line, avoiding overlaps
   */
  private respawnCueBall(): void {
    const basePos = { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT * 0.5 };
    
    // Shift slightly right/left if another ball blocks the respawn spot
    let finalPos = { ...basePos };
    let safetyCounter = 0;
    
    while (safetyCounter < 50) {
      const collision = this.balls
        .filter(b => b.type !== 'cue' && !b.isPocketed)
        .some(b => Vector.dist(b.position, finalPos) < BALL_RADIUS * 2.1);
      
      if (!collision) break;

      // Shift slightly right
      finalPos.x += BALL_RADIUS * 2.2;
      safetyCounter++;
    }

    this.cueBall.position = finalPos;
    this.cueBall.velocity = Vector.create(0, 0);
    this.cueBall.isPocketed = false;
    this.cueBall.scale = 1.0;
  }

  /**
   * Draws the frame graphics
   */
  private render(): void {
    this.renderer.clear();
    
    // 1. Draw Table felt, lines, border, and pockets
    this.renderer.drawTable(this.table);

    // 2. Draw Balls
    // Draw in reverse order so the cue ball usually renders on top
    for (let i = this.balls.length - 1; i >= 0; i--) {
      this.renderer.drawBall(this.balls[i]);
    }

    // 3. Draw Aim Guide & Cue Stick (only during player's turn)
    const state = this.stateManager.currentState;
    if (state === GameState.AIMING || state === GameState.CHARGING) {
      this.renderer.drawAimGuide(this.cueBall, this.cueStick.angle, this.balls);
      this.renderer.drawCueStick(this.cueBall, this.cueStick);
    }
  }

  /**
   * Triggers a manual restart of the game layout
   */
  public restart(): void {
    this.initGame();
  }

  /**
   * Destroys the game instance, cleaning up animations and event hooks
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.input.destroy();
  }
}
