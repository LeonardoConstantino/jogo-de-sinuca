import { Vector } from '../utils/vector.utils';

export class CollisionManager {
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Initialized lazily to comply with browser autoplay security constraints
  }

  /**
   * Lazily spawns the AudioContext upon user input
   */
  private initAudio(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  /**
   * Synthesizes a realistic wooden billiard ball collision (clack)
   * Pitch and volume are sensitive to relative contact velocity
   */
  public playBallCollisionSound(relativeVelocityMag: number): void {
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Map collision velocity to volume
      const volume = Math.min(0.6, relativeVelocityMag * 0.08);
      if (volume < 0.02) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Billiards clack is a fast, high-pitch triangle sweep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.035);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  }

  /**
   * Synthesizes a low-frequency muffled thud for cushion rails rebounds
   */
  public playCushionCollisionSound(velocityMag: number): void {
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const volume = Math.min(0.4, velocityMag * 0.06);
      if (volume < 0.02) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Cushion hit is a deeper sine sweep with slightly longer decay
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio failed
    }
  }

  /**
   * Synthesizes a satisfying pocket drop pop/slide sound
   */
  public playPocketSunkSound(): void {
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Sinking sound descends in frequency over a longer decay
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);

      gainNode.gain.setValueAtTime(0.28, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio failed
    }
  }
}
