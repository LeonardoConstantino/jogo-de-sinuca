import { GameState, GameStats } from '../types';

export class GameStateManager {
  private state: GameState = GameState.AIMING;
  
  public stats: GameStats = {
    shots: 0,
    ballsSunk: 0,
    cueSunkCount: 0,
    consecutiveShots: 0,
    lastBallSunkType: null
  };

  public gameMessage: string = 'Sua vez! Use o mouse para mirar e arraste para trás para carregar a força.';
  public isVictory: boolean = false;
  public isDefeat: boolean = false;

  public get currentState(): GameState {
    return this.state;
  }

  /**
   * Safe transition handler between gameplay states
   */
  public changeState(newState: GameState): void {
    this.state = newState;

    switch (newState) {
      case GameState.AIMING:
        if (!this.isVictory && !this.isDefeat) {
          this.gameMessage = 'Mire e lance a bola branca!';
        }
        break;
      case GameState.CHARGING:
        this.gameMessage = 'Puxe e solte para dar a tacada...';
        break;
      case GameState.SHOOTING:
        this.gameMessage = 'Tacada desferida!';
        break;
      case GameState.BALLS_MOVING:
        this.gameMessage = 'Bolas em movimento...';
        break;
      case GameState.GAME_OVER:
        if (this.isVictory) {
          this.gameMessage = '🏆 Vitória! Você limpou a mesa e encaçapou a bola 8 por último!';
        } else {
          this.gameMessage = '💥 Derrota! Você encaçapou a bola 8 antes de limpar as outras bolas.';
        }
        break;
    }
  }

  /**
   * Tracks an active shot taken by player
   */
  public recordShot(): void {
    this.stats.shots++;
  }

  /**
   * Tracks a successful ball sunk
   */
  public recordSunkBall(type: string): void {
    this.stats.ballsSunk++;
    this.stats.lastBallSunkType = type;
  }

  /**
   * Tracks a cue ball pocket scratch
   */
  public recordScratch(): void {
    this.stats.cueSunkCount++;
    this.gameMessage = '⚠️ Falta (Scratch)! A bola branca caiu na caçapa e foi recolocada na mesa.';
  }

  /**
   * Triggers victory condition
   */
  public setVictory(): void {
    this.isVictory = true;
    this.isDefeat = false;
    this.changeState(GameState.GAME_OVER);
  }

  /**
   * Triggers premature 8-ball loss condition
   */
  public setDefeat(): void {
    this.isDefeat = true;
    this.isVictory = false;
    this.changeState(GameState.GAME_OVER);
  }

  /**
   * Resets the entire state
   */
  public reset(): void {
    this.state = GameState.AIMING;
    this.stats = {
      shots: 0,
      ballsSunk: 0,
      cueSunkCount: 0,
      consecutiveShots: 0,
      lastBallSunkType: null
    };
    this.gameMessage = 'Jogo reiniciado! Mire e prepare-se.';
    this.isVictory = false;
    this.isDefeat = false;
  }
}
