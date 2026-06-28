import { Vector, Vector2D } from '../utils/vector.utils';
import { Ball } from '../entities/Ball';
import { Pocket } from '../entities/Pocket';
import { Table } from '../entities/Table';
import { CueStick } from '../entities/CueStick';
import { COLORS, BALL_RADIUS, TABLE_WIDTH, TABLE_HEIGHT } from '../config/constants';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get Canvas 2D context');
    }
    this.ctx = context;
  }

  /**
   * Clears the canvas
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the entire table, felt, cushions, and pockets
   */
  public drawTable(table: Table): void {
    const { ctx } = this;
    const w = table.width;
    const h = table.height;
    const border = table.borderWidth;

    ctx.save();

    // 1. Draw outer wood border with round corners
    ctx.fillStyle = table.borderColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.tableOuterShadow;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Draw rounded rect border
    this.drawRoundedRect(-border, -border, w + border * 2, h + border * 2, 24);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset shadows

    // 2. Draw border inner highlight (slight mahogany sheen)
    ctx.strokeStyle = COLORS.borderHighlight;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Draw Table Diamond sights (6 on long rails, 3 on short rails)
    ctx.fillStyle = '#fef08a'; // Bright gold dots
    const drawDiamond = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Top & Bottom Diamonds
    for (let i = 1; i <= 7; i++) {
      if (i === 4) continue; // Skip middle pocket spot
      const dx = (w / 8) * i;
      drawDiamond(dx, -border / 2);
      drawDiamond(dx, h + border / 2);
    }
    // Left & Right Diamonds
    for (let i = 1; i <= 3; i++) {
      const dy = (h / 4) * i;
      drawDiamond(-border / 2, dy);
      drawDiamond(w + border / 2, dy);
    }

    // 4. Draw main table felt with a subtle overhead lighting gradient
    const feltGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
    feltGrad.addColorStop(0, COLORS.feltBright);
    feltGrad.addColorStop(1, COLORS.felt);
    ctx.fillStyle = feltGrad;
    ctx.fillRect(0, 0, w, h);

    // 5. Draw Headstring line & D-Zone (starting position guidelines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;

    // Headstring line
    const headstringX = w * 0.25;
    ctx.beginPath();
    ctx.moveTo(headstringX, 0);
    ctx.lineTo(headstringX, h);
    ctx.stroke();

    // D-Zone semicircle
    ctx.beginPath();
    ctx.arc(headstringX, h / 2, h / 6, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.stroke();

    // Apex Rack Spot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(w * 0.75, h / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // 6. Draw Table Cushions (inner bumper bevels)
    ctx.fillStyle = '#064e3b'; // Deep dark cushion bevel
    // Top cushion
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 12, 12); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
    // Bottom cushion
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w - 12, h - 12); ctx.lineTo(12, h - 12); ctx.closePath(); ctx.fill();
    // Left cushion
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, h); ctx.lineTo(12, h - 12); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
    // Right cushion
    ctx.beginPath();
    ctx.moveTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(w - 12, h - 12); ctx.lineTo(w - 12, 12); ctx.closePath(); ctx.fill();

    // 7. Draw Pockets
    for (const pocket of table.pockets) {
      this.drawPocket(pocket);
    }

    ctx.restore();
  }

  /**
   * Draws a pocket with dark depth, soft inner shadows, and metallic rims
   */
  private drawPocket(pocket: Pocket): void {
    const { ctx } = this;
    const { x, y } = pocket.position;
    const r = pocket.radius;

    ctx.save();

    // Metallic pocket collar outline
    ctx.strokeStyle = '#4b5563'; // Silver/grey rim
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x, y, r + 1, 0, Math.PI * 2);
    ctx.stroke();

    // Deep pocket hole gradient (creates depth)
    const pocketGrad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    pocketGrad.addColorStop(0, '#000000');
    pocketGrad.addColorStop(0.7, '#111827');
    pocketGrad.addColorStop(1, '#020617');

    ctx.fillStyle = pocketGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws a highly polished 3D-shaded billiard ball
   */
  public drawBall(ball: Ball): void {
    if (ball.isPocketed && ball.scale <= 0) return;

    const { ctx } = this;
    const { x, y } = ball.position;
    const r = ball.radius * ball.scale;

    ctx.save();

    // 1. Draw smooth soft drop shadow underneath
    // Offset is slightly shifted down-right for overhead light angle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 3, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Ball Base Globe
    if (ball.type === 'striped') {
      // White base circle
      ctx.fillStyle = '#fafafa';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Clip mask to draw colored stripe center band
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = ball.color;
      // Draw a rotated stripe based on static angle to feel natural
      ctx.fillRect(x - r * 1.5, y - r * 0.45, r * 3, r * 0.9);
      ctx.restore();
    } else {
      // Solid/Eight/Cue Ball
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw White Number Circle (except for plain cue ball)
    if (ball.type !== 'cue') {
      const circleRadius = r * 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Number Text
      ctx.fillStyle = '#18181b';
      ctx.font = `bold ${Math.max(6, Math.floor(r * 0.7))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ball.number.toString(), x, y + 0.5);
    }

    // 4. Glossy 3D Highlight Overlay
    const shinyGrad = ctx.createRadialGradient(
      x - r * 0.35,
      y - r * 0.35,
      r * 0.05,
      x - r * 0.1,
      y - r * 0.1,
      r
    );
    shinyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    shinyGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.2)');
    shinyGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
    shinyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

    ctx.fillStyle = shinyGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws a beautiful tapered pool cue stick pointing towards the cue ball
   */
  public drawCueStick(cueBall: Ball, stick: CueStick): void {
    if (!stick.isActive || cueBall.isPocketed) return;

    const { ctx } = this;
    const angle = stick.angle;
    const power = stick.power;

    ctx.save();

    // Cue stick pulls back as shot power is loaded
    const baseOffset = BALL_RADIUS + 12;
    const pullBackOffset = power * 0.5; // Up to 50px pullback
    const totalOffset = baseOffset + pullBackOffset;

    // Center translation to cue ball
    ctx.translate(cueBall.position.x, cueBall.position.y);
    // Rotate to aim angle
    ctx.rotate(angle);

    // Draw Cue stick extending backwards from cue ball along -X axis
    // Tapered stick: Tip at -totalOffset, handle at -(totalOffset + len)
    const len = 220;
    const tipWidth = 1.8;
    const handleWidth = 4.0;

    const tipX = -totalOffset;
    const handleX = -(totalOffset + len);

    // Draw Drop Shadow for cue stick (height offset)
    ctx.save();
    ctx.translate(2, 6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(tipX, -tipWidth);
    ctx.lineTo(handleX, -handleWidth);
    ctx.lineTo(handleX, handleWidth);
    ctx.lineTo(tipX, tipWidth);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 1. Draw shaft (majority of cue length)
    const shaftLen = len * 0.65;
    ctx.fillStyle = COLORS.cueStick; // Ivory light wood
    ctx.beginPath();
    ctx.moveTo(tipX, -tipWidth);
    ctx.lineTo(tipX - shaftLen, -tipWidth - 1);
    ctx.lineTo(tipX - shaftLen, tipWidth + 1);
    ctx.lineTo(tipX, tipWidth);
    ctx.closePath();
    ctx.fill();

    // 2. Draw Ivory/White chalk collar ring (Ferrule)
    const ferruleLen = 5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tipX, -tipWidth, -ferruleLen, tipWidth * 2);

    // 3. Draw Teal Cue tip (Chalked tip)
    const tipLen = 2.5;
    ctx.fillStyle = COLORS.cueStickTip;
    ctx.fillRect(tipX, -tipWidth + 0.2, tipLen, (tipWidth - 0.2) * 2);

    // 4. Draw Grip Handle (dark leather wood wrap)
    const handleLen = len - shaftLen;
    ctx.fillStyle = COLORS.cueStickHandle;
    ctx.beginPath();
    ctx.moveTo(tipX - shaftLen, -tipWidth - 1);
    ctx.lineTo(handleX, -handleWidth);
    ctx.lineTo(handleX, handleWidth);
    ctx.lineTo(tipX - shaftLen, tipWidth + 1);
    ctx.closePath();
    ctx.fill();

    // Grip texture wraps (decorative rings)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let rx = tipX - shaftLen - 10; rx > handleX + 15; rx -= 15) {
      ctx.beginPath();
      ctx.moveTo(rx, -tipWidth - 1.5);
      ctx.lineTo(rx, tipWidth + 1.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Performs dynamic raycast and renders precise aiming guideline, 
   * target ghost ball, and deflection directions!
   */
  public drawAimGuide(cueBall: Ball, angle: number, balls: Ball[]): void {
    if (cueBall.isPocketed) return;

    const { ctx } = this;
    const start = cueBall.position;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };

    let closestDist = Infinity;
    let hitBall: Ball | null = null;

    const activeBalls = balls.filter(b => b !== cueBall && !b.isPocketed);

    // Check intersection with all other balls (treating cue ball as moving circle)
    // Cue ball can get as close as 2 * BALL_RADIUS to another ball's center
    const hitRadius = BALL_RADIUS * 2;

    for (const ball of activeBalls) {
      const v = Vector.sub(ball.position, start);
      const proj = Vector.dot(v, dir);

      if (proj <= 0) continue; // Behind cue ball ray

      const perpSq = Vector.magSq(v) - proj * proj;
      const hitRadiusSq = hitRadius * hitRadius;

      if (perpSq > hitRadiusSq) continue; // Ray misses this ball's collision boundary

      // Solve exact distance along ray to contact point
      const offsetDist = Math.sqrt(hitRadiusSq - perpSq);
      const dist = proj - offsetDist;

      if (dist > 0 && dist < closestDist) {
        closestDist = dist;
        hitBall = ball;
      }
    }

    // Now check Table boundaries (cushions) to find wall intersection as fallback
    let wallHitPoint = Vector.create();
    let hitWall = false;

    if (closestDist === Infinity) {
      // Cast ray to walls
      const bounds = {
        left: BALL_RADIUS,
        right: TABLE_WIDTH - BALL_RADIUS,
        top: BALL_RADIUS,
        bottom: TABLE_HEIGHT - BALL_RADIUS
      };

      // Solve t for x wall
      let tx = Infinity;
      if (dir.x > 0) {
        tx = (bounds.right - start.x) / dir.x;
      } else if (dir.x < 0) {
        tx = (bounds.left - start.x) / dir.x;
      }

      // Solve t for y wall
      let ty = Infinity;
      if (dir.y > 0) {
        ty = (bounds.bottom - start.y) / dir.y;
      } else if (dir.y < 0) {
        ty = (bounds.top - start.y) / dir.y;
      }

      closestDist = Math.min(tx, ty);
      wallHitPoint = Vector.add(start, Vector.mult(dir, closestDist));
      hitWall = true;
    }

    // Solve contact position (center of cue ball at moment of impact)
    const impactPoint = Vector.add(start, Vector.mult(dir, closestDist));

    // 1. Draw Dotted Aiming Line from cue ball to impact point
    ctx.save();
    ctx.strokeStyle = COLORS.aimGuide;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(impactPoint.x, impactPoint.y);
    ctx.stroke();
    ctx.restore();

    // 2. If hitting another ball, draw ghost cue ball and deflection lines
    if (hitBall) {
      // Draw Ghost Cue Ball at impact point
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(impactPoint.x, impactPoint.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Deflection direction vectors:
      // Object ball goes directly along line of centers (from impact point to ball center)
      const targetDir = Vector.normalize(Vector.sub(hitBall.position, impactPoint));
      
      // Cue ball deflects perpendicular to the contact line (90 degrees deflection angle)
      // Normal vector is perpendicular to targetDir
      const tangentDir = { x: -targetDir.y, y: targetDir.x };
      
      // Determine correct tangent direction (pointing away from impact projection side)
      const sideProj = Vector.dot(dir, tangentDir);
      const cueDeflectDir = Vector.mult(tangentDir, Math.sign(sideProj));

      // Draw object ball prediction path line
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'; // Amber yellow guide for object ball
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hitBall.position.x, hitBall.position.y);
      const targetLineEnd = Vector.add(hitBall.position, Vector.mult(targetDir, 50));
      ctx.lineTo(targetLineEnd.x, targetLineEnd.y);
      ctx.stroke();
      
      // Tiny arrow/circle at prediction end
      ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.beginPath();
      ctx.arc(targetLineEnd.x, targetLineEnd.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw cue ball deflection path line
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(impactPoint.x, impactPoint.y);
      const cueLineEnd = Vector.add(impactPoint, Vector.mult(cueDeflectDir, 40));
      ctx.lineTo(cueLineEnd.x, cueLineEnd.y);
      ctx.stroke();
      ctx.restore();
    } else if (hitWall) {
      // Just draw contact dot on wall
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(wallHitPoint.x, wallHitPoint.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Helper to draw a canvas rounded rectangle
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
