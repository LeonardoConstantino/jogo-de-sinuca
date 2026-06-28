import { Vector2D, Vector } from '../utils/vector.utils';

export class InputController {
  private element: HTMLElement;
  private canvasRect: DOMRect | null = null;

  public mousePosition: Vector2D = Vector.create(0, 0);
  public isMouseDown: boolean = false;
  public dragStartPosition: Vector2D = Vector.create(0, 0);
  public dragDistance: number = 0;

  // Custom callback triggers
  public onShoot: (power: number) => void = () => {};
  public onAimMove: (mousePos: Vector2D) => void = () => {};

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }

  /**
   * Caches the element bounding rect for accurate coordinate conversions
   */
  public updateRect(): void {
    this.canvasRect = this.element.getBoundingClientRect();
  }

  /**
   * Sets up mouse event listeners
   */
  private setupEventListeners(): void {
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // For touch screens (mobile support is a nice bonus)
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * Helper to convert window client mouse coords into relative canvas element coordinates
   */
  private getRelativeCoords(clientX: number, clientY: number): Vector2D {
    if (!this.canvasRect) {
      this.updateRect();
    }
    const rect = this.canvasRect || this.element.getBoundingClientRect();
    
    // Support correct scaling since canvas style dimensions might differ from intrinsic width/height
    const scaleX = (this.element as HTMLCanvasElement).width / rect.width;
    const scaleY = (this.element as HTMLCanvasElement).height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private handleMouseDown(e: MouseEvent): void {
    this.updateRect();
    const pos = this.getRelativeCoords(e.clientX, e.clientY);
    this.isMouseDown = true;
    this.dragStartPosition = pos;
    this.dragDistance = 0;
  }

  private handleMouseMove(e: MouseEvent): void {
    const pos = this.getRelativeCoords(e.clientX, e.clientY);
    this.mousePosition = pos;

    if (this.isMouseDown) {
      // Drag distance is how far mouse has moved since pressing down
      this.dragDistance = Vector.dist(this.dragStartPosition, pos);
    }

    this.onAimMove(this.mousePosition);
  }

  private handleMouseUp(): void {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;

    // Trigger shot callback with current drag distance
    this.onShoot(this.dragDistance);
    this.dragDistance = 0;
  }

  // --- Mobile Touch Event Wrappers ---
  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    e.preventDefault(); // Stop scrolling when aiming
    this.updateRect();
    const touch = e.touches[0];
    const pos = this.getRelativeCoords(touch.clientX, touch.clientY);
    this.isMouseDown = true;
    this.dragStartPosition = pos;
    this.dragDistance = 0;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = this.getRelativeCoords(touch.clientX, touch.clientY);
    this.mousePosition = pos;

    if (this.isMouseDown) {
      this.dragDistance = Vector.dist(this.dragStartPosition, pos);
    }

    this.onAimMove(this.mousePosition);
  }

  private handleTouchEnd(): void {
    this.handleMouseUp();
  }

  /**
   * Resets internal states
   */
  public reset(): void {
    this.isMouseDown = false;
    this.dragDistance = 0;
  }

  /**
   * Destroys window listeners to prevent memory leaks
   */
  public destroy(): void {
    // Clean up window level listeners
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}
