export interface IGameControl {
  scene: number[][];
  currentShape: number[][];
  currentShapeColor: string;
  currentRow: number;
  currentCol: number;
  isGameOver: boolean;
  isGamePaused: boolean;
  score: number;
  highScore: string;
  tickRate: number;
  nextShape: number[][];
  nextShapeColor: string;
}

export type IOtherPlayerState = Pick<
  IGameControl,
  'scene' | 'currentShape' | 'currentRow' | 'currentCol' | 'currentShapeColor' | 'score'
>;
