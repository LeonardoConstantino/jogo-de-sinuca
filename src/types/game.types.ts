export enum GameState {
  AIMING = 'AIMING',
  CHARGING = 'CHARGING',
  SHOOTING = 'SHOOTING',
  BALLS_MOVING = 'BALLS_MOVING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameStats {
  shots: number;
  ballsSunk: number;
  cueSunkCount: number;
  consecutiveShots: number;
  lastBallSunkType: string | null;
}
