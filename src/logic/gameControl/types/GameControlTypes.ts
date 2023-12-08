export interface IGameControl {
  scene: number[][];
  currentShape: number[][];
  currentShapeColor: string;
  currentRow: number;
  currentCol: number;
  isGameOver: boolean;
}
