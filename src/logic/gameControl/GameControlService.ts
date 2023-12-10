import { Colors } from '../../styles/Colors';
import { IGameControl } from './types/GameControlTypes';
import { GameControlHelper } from './helpers/GameControlHelper';

export class GameControlService {
  placeShape = (
    params: Pick<IGameControl, 'scene' | 'currentShape' | 'currentRow' | 'currentCol' | 'currentShapeColor'>,
  ) => {
    const newScene = [...params.scene];

    for (let i = 0; i < params.currentShape.length; i++) {
      for (let j = 0; j < params.currentShape[i].length; j++) {
        if (params.currentShape[i][j]) {
          newScene[params.currentRow + i][params.currentCol + j] = Colors.indexOf(params.currentShapeColor) + 1;
        }
      }
    }

    return newScene;
  };

  clearLines = (scene: number[][]) => {
    const notEmptyLines = scene.filter(row => !row.every(cell => cell !== 0));
    const clearedLinesAmount = GameControlHelper.getSceneSize().rows - notEmptyLines.length;
    const emptyLines = Array.from({ length: clearedLinesAmount }, () =>
      Array(GameControlHelper.getSceneSize().cols).fill(0),
    );

    return {
      newScene: [...emptyLines, ...notEmptyLines],
      linesCleared: emptyLines.length,
    };
  };

  setHighScore = (score: number) => {
    localStorage.setItem('highScore', score.toString());
  };
}
