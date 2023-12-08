import { useEffect, useReducer, useRef } from 'react';
import { Colors } from '../styles/Colors';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../RootStore';
import { GameControlHelper } from '../logic/gameControl/helpers/GameControlHelper';

export const GameField = observer(() => {
  const { gameControlStore } = useRootStore();

  const [tick, toggleTick] = useReducer(state => !state, false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effects

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    const cellSize = GameControlHelper.getSceneSize().cellSize;
    const shape = gameControlStore.currentShape;

    const renderScene = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // render scene
      for (let i = 0; i < GameControlHelper.getSceneSize().rows; i++) {
        for (let j = 0; j < GameControlHelper.getSceneSize().cols; j++) {
          const cellValue = gameControlStore.scene[i][j];

          if (ctx && cellValue !== 0) {
            const x = j * cellSize;
            const y = i * cellSize;

            // fill a placed shape cell
            ctx.fillStyle = Colors[cellValue - 1];
            ctx.fillRect(x, y, cellSize, cellSize);

            // draw a stroke around the cell
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }

      // render current falling shape
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (ctx && shape[i][j] !== 0) {
            const x = (gameControlStore.currentCol + j) * cellSize;
            const y = (gameControlStore.currentRow + i) * cellSize;

            // fill a current shape cell
            ctx.fillStyle = gameControlStore.currentShapeColor;
            ctx.fillRect(x, y, cellSize, cellSize);

            // draw a stroke around the current shape cell
            ctx.strokeStyle = '#000'; // Black stroke color
            ctx.lineWidth = 2; // Adjust the stroke width as needed
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }
    };

    renderScene();
  }, [
    gameControlStore.scene,
    gameControlStore.currentShape,
    gameControlStore.currentShapeColor,
    gameControlStore.currentRow,
    gameControlStore.currentCol,
  ]);

  // init game
  useEffect(() => {
    gameControlStore.spawnRandomShape();
  }, []);

  useEffect(() => {
    if (gameControlStore.isGameOver) {
      return;
    }

    const intervalId = setInterval(() => {
      toggleTick();
    }, gameControlStore.tickRate);

    return () => clearInterval(intervalId);
  }, [gameControlStore.isGameOver, gameControlStore.tickRate]);

  useEffect(() => {
    handleMoveDown();
  }, [tick]);

  useEffect(() => {
    if (gameControlStore.isGameOver) {
      gameControlStore.saveHighScore();
    }
  }, [gameControlStore.isGameOver]);

  // Handlers

  const handleMoveDown = () => {
    gameControlStore.moveDown();
  };

  const handleMoveHorizontally = (offset: number) => {
    gameControlStore.moveHorizontally(offset);
  };

  const handleRotateShape = () => {
    gameControlStore.rotateShape();
  };

  const handleKeyDown = event => {
    switch (event.key) {
      case 'ArrowLeft':
        handleMoveHorizontally(-1);
        break;
      case 'ArrowRight':
        handleMoveHorizontally(1);
        break;
      case 'ArrowDown':
        handleMoveDown();
        break;
      case 'ArrowUp':
        handleRotateShape();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Renders

  return (
    <div>
      <div style={styles.gameContainer}>
        <canvas
          style={styles.canvas}
          ref={canvasRef}
          width={GameControlHelper.getSceneSize().width}
          height={GameControlHelper.getSceneSize().height}
        />
        <div style={styles.infoContainer}>
          <h3>TOP: {gameControlStore.highScore}</h3>
          <h3>SCORE: {gameControlStore.score}</h3>
        </div>
      </div>
      {gameControlStore.isGameOver ? (
        <div style={styles.gameOver}>
          <h2>Game Over</h2>
        </div>
      ) : null}
    </div>
  );
});

const styles = {
  canvas: {
    border: 'solid',
    borderWidth: 1,
  },
  gameOver: {
    display: 'flex',
    justifyContent: 'center',
  },
  infoContainer: {
    marginLeft: 16,
  },
  gameContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
  },
};
