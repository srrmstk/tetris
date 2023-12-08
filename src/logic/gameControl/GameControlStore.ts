import { IGameControl } from './types/GameControlTypes';
import { GameControlHelper } from './helpers/GameControlHelper';
import { makeAutoObservable } from 'mobx';
import { Colors } from '../../styles/Colors';
import { GameControlService } from './GameControlService';

export class GameControlStore implements IGameControl {
  scene: number[][] = Array.from({ length: GameControlHelper.getSceneSize().rows }, () =>
    Array(GameControlHelper.getSceneSize().cols).fill(0),
  );

  currentCol: number = 0;
  currentRow: number = Math.floor((GameControlHelper.getSceneSize().cols - 1) / 2); // center of the scene
  currentShape: number[][] = [[]];
  currentShapeColor: string = '';
  isGameOver: boolean = false;
  score: number = 0;
  tickRate: number = 500;
  highScore: string = localStorage.getItem('highScore') || '0';

  gameControlService: GameControlService;

  constructor() {
    makeAutoObservable(this);
    this.gameControlService = new GameControlService();
  }

  // HIGHSCORE LOGIC

  saveHighScore = () => {
    this.gameControlService.setHighScore(this.score);
  };

  // SCENE LOGIC

  placeShape = () => {
    const params = {
      scene: this.scene,
      currentShape: this.currentShape,
      currentRow: this.currentRow,
      currentCol: this.currentCol,
      currentShapeColor: this.currentShapeColor,
    };
    const newScene = this.gameControlService.placeShape(params);
    this.setScene(newScene);
  };

  clearLines = () => {
    const { newScene, linesCleared } = this.gameControlService.clearLines(this.scene);
    this.setScene(newScene);

    if (!linesCleared) {
      return;
    }

    this.setScore(this.score + 100 * linesCleared);

    if (this.tickRate >= 100) {
      this.setTickrate(this.tickRate - 10);
    }
  };

  spawnRandomShape = () => {
    const shapes = GameControlHelper.getFigureShapes();
    const cols = GameControlHelper.getSceneSize().cols;

    const randomIndex = Math.floor(Math.random() * shapes.length);
    const newShape = shapes[randomIndex];

    if (this.checkIfShapeCanBePlaced(0, Math.floor((cols - newShape[0].length) / 2))) {
      this.setCurrentShape(newShape);
      this.setCurrentShapeColor(Colors[randomIndex]);
      this.setCurrentRow(0);
      this.setCurrentCol(Math.floor((cols - newShape[0].length) / 2));
    } else {
      this.setGameOver(true);
    }
  };

  // SHAPE TRANSFORM LOGIC

  checkIfShapeCanBeRotated = () => {
    const rotatedShape = this.currentShape[0].map((_, i) => this.currentShape.map(row => row[i]).reverse());

    for (let i = 0; i < rotatedShape.length; i++) {
      for (let j = 0; j < rotatedShape[i].length; j++) {
        if (
          rotatedShape[i][j] &&
          (this.scene[this.currentRow + i] && this.scene[this.currentRow + i][this.currentCol + j]) !== 0
        ) {
          return false;
        }
      }
    }

    return true;
  };

  checkIfShapeCanBePlaced = (row: number, col: number) => {
    for (let i = 0; i < this.currentShape.length; i++) {
      for (let j = 0; j < this.currentShape[i].length; j++) {
        if (this.currentShape[i][j] && (this.scene[row + i] && this.scene[row + i][col + j]) !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  rotateShape = () => {
    if (this.checkIfShapeCanBeRotated()) {
      const rotatedShape = this.currentShape[0].map((_, i) => this.currentShape.map(row => row[i]).reverse());
      this.setCurrentShape(rotatedShape);
    }
  };

  moveDown = () => {
    if (this.isGameOver) {
      return;
    }

    if (this.checkIfShapeCanBePlaced(this.currentRow + 1, this.currentCol)) {
      this.setCurrentRow(this.currentRow + 1);
    } else {
      this.placeShape();
      this.clearLines();
      this.spawnRandomShape();
    }
  };

  moveHorizontally = (offset: number) => {
    if (this.checkIfShapeCanBePlaced(this.currentRow, this.currentCol + offset)) {
      this.setCurrentCol(this.currentCol + offset);
    }
  };

  // SETTERS

  private setScore = (value: number) => {
    this.score = value;
  };

  private setTickrate = (value: number) => {
    this.tickRate = value;
  };

  private setScene = (value: number[][]) => {
    this.scene = value;
  };

  private setCurrentShape = (value: number[][]) => {
    this.currentShape = value;
  };

  private setCurrentRow = (value: number) => {
    this.currentRow = value;
  };

  private setCurrentCol = (value: number) => {
    this.currentCol = value;
  };

  private setCurrentShapeColor = (value: string) => {
    this.currentShapeColor = value;
  };

  private setGameOver = (value: boolean) => {
    this.isGameOver = value;
  };
}
