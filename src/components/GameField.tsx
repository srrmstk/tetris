import {useEffect, useReducer, useRef, useState} from 'react';
import {BLOCK_SIZE, COLS, ROWS} from './GameFieldConsts';
import {SHAPES} from './TetrominoShapeTypes';
import {Colors} from '../styles/Colors';

export const GameField = () => {
  const [board, setBoard] = useState(Array.from({length: ROWS}, () => Array(COLS).fill(0)));
  const [currentShape, setCurrentShape] = useState<number[][]>([[]]);
  const [currentShapeColor, setCurrentShapeColor] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(Math.floor((COLS - 1) / 2));

  const [isGameOver, toggleIsGameOver] = useReducer(state => !state, false);
  const [tick, toggleTick] = useReducer(state => !state, false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tickRate = 500;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    const drawGame = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the game board
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          const cellValue = board[i][j];

          if (ctx && cellValue !== 0) {
            const x = j * BLOCK_SIZE;
            const y = i * BLOCK_SIZE;

            // Fill a placed shape cell
            ctx.fillStyle = Colors[cellValue - 1];
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

            // Draw a stroke around the cell
            ctx.strokeStyle = '#000'; // Black stroke color
            ctx.lineWidth = 2; // Adjust the stroke width as needed
            ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }

      // Draw the current falling shape
      for (let i = 0; i < currentShape.length; i++) {
        for (let j = 0; j < currentShape[i].length; j++) {
          if (ctx && currentShape[i][j] !== 0) {
            const x = (currentCol + j) * BLOCK_SIZE;
            const y = (currentRow + i) * BLOCK_SIZE;

            // Fill a falling shape cell
            ctx.fillStyle = currentShapeColor;
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

            // Draw a stroke around the cell of the falling shape
            ctx.strokeStyle = '#000'; // Black stroke color
            ctx.lineWidth = 2; // Adjust the stroke width as needed
            ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
    };

    drawGame();
  }, [board, currentShape, currentShapeColor, currentRow, currentCol]);

  const spawnRandomShape = () => {
    if (isGameOver) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    const newShape = SHAPES[randomIndex];
    const newColor = Colors[randomIndex];

    if (canPlaceShape(0, Math.floor((COLS - newShape[0].length) / 2))) {
      setCurrentShape(newShape);
      setCurrentShapeColor(newColor);
      setCurrentRow(0);
      setCurrentCol(Math.floor((COLS - SHAPES[randomIndex][0].length) / 2));
    } else {
      toggleIsGameOver();
    }
  };

  const canPlaceShape = (row: number, col: number) => {
    for (let i = 0; i < currentShape.length; i++) {
      for (let j = 0; j < currentShape[i].length; j++) {
        if (currentShape[i][j] && (board[row + i] && board[row + i][col + j]) !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  const placeShape = () => {
    const newBoard = [...board];

    for (let i = 0; i < currentShape.length; i++) {
      for (let j = 0; j < currentShape[i].length; j++) {
        if (currentShape[i][j]) {
          newBoard[currentRow + i][currentCol + j] = Colors.indexOf(currentShapeColor) + 1;
        }
      }
    }

    setBoard(newBoard);
  };

  const moveDown = () => {
    if (isGameOver) {
      return;
    }

    if (canPlaceShape(currentRow + 1, currentCol)) {
      setCurrentRow(currentRow + 1);
    } else {
      placeShape();
      clearLines();
      spawnRandomShape();
    }
  };

  const moveLeft = () => {
    if (canPlaceShape(currentRow, currentCol - 1)) {
      setCurrentCol(currentCol - 1);
    }
  };

  const moveRight = () => {
    if (canPlaceShape(currentRow, currentCol + 1)) {
      setCurrentCol(currentCol + 1);
    }
  };

  const canRotate = () => {
    const rotatedShape = currentShape[0].map((_, i) => currentShape.map(row => row[i]).reverse());

    for (let i = 0; i < rotatedShape.length; i++) {
      for (let j = 0; j < rotatedShape[i].length; j++) {
        if (rotatedShape[i][j] && (board[currentRow + i] && board[currentRow + i][currentCol + j]) !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  const rotateShape = () => {
    const rotatedShape = currentShape[0].map((_, i) => currentShape.map(row => row[i]).reverse());

    if (canRotate()) {
      setCurrentShape(rotatedShape);
    }
  };

  const handleKeyDown = event => {
    switch (event.key) {
      case 'ArrowLeft':
        moveLeft();
        break;
      case 'ArrowRight':
        moveRight();
        break;
      case 'ArrowDown':
        moveDown();
        break;
      case 'ArrowUp':
        rotateShape();
        break;
      default:
        break;
    }
  };

  const clearLines = () => {
    const newBoard = board.filter(row => !row.every(cell => cell !== 0));

    const linesCleared = ROWS - newBoard.length;

    const emptyLines = Array.from({length: linesCleared}, () => Array(COLS).fill(0));
    const finalBoard = [...emptyLines, ...newBoard];

    setBoard(finalBoard);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    spawnRandomShape();
  }, []);

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    const intervalId = setInterval(() => {
      toggleTick();
    }, tickRate);

    return () => clearInterval(intervalId);
  }, [isGameOver]);

  useEffect(() => {
    moveDown();
  }, [tick]);

  return (
    <div>
      <canvas
        style={{border: 'solid', borderWidth: 1}}
        ref={canvasRef}
        width={COLS * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
      />
      {isGameOver ? (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <h2>Game over!</h2>
        </div>
      ) : null}
    </div>
  );
};
