import { TableData, PocketData } from '../types';
import { Pocket } from './Pocket';
import { TABLE_WIDTH, TABLE_HEIGHT, POCKET_RADIUS, COLORS, BOARD_PADDING } from '../config/constants';

export class Table implements TableData {
  public width: number;
  public height: number;
  public feltColor: string;
  public borderColor: string;
  public borderWidth: number;
  public pockets: Pocket[];

  constructor() {
    this.width = TABLE_WIDTH;
    this.height = TABLE_HEIGHT;
    this.feltColor = COLORS.felt;
    this.borderColor = COLORS.border;
    this.borderWidth = BOARD_PADDING;

    // Initialize the 6 pockets in their standard positions
    // Corner pockets are slightly pushed outward to give a natural entry pocket look
    const cornerOffset = 4;
    const sideOffset = 2;

    this.pockets = [
      new Pocket('pocket-top-left', { x: cornerOffset, y: cornerOffset }, POCKET_RADIUS + 3),
      new Pocket('pocket-top-mid', { x: TABLE_WIDTH / 2, y: -sideOffset }, POCKET_RADIUS),
      new Pocket('pocket-top-right', { x: TABLE_WIDTH - cornerOffset, y: cornerOffset }, POCKET_RADIUS + 3),
      new Pocket('pocket-bot-left', { x: cornerOffset, y: TABLE_HEIGHT - cornerOffset }, POCKET_RADIUS + 3),
      new Pocket('pocket-bot-mid', { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT + sideOffset }, POCKET_RADIUS),
      new Pocket('pocket-bot-right', { x: TABLE_WIDTH - cornerOffset, y: TABLE_HEIGHT - cornerOffset }, POCKET_RADIUS + 3)
    ];
  }
}
