import { useEffect, useReducer, useRef } from 'react';
import { Colors } from '../styles/Colors';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../RootStore';
import { GameControlHelper } from '../logic/gameControl/helpers/GameControlHelper';

export const GameField = observer(() => {
  const { gameControlStore } = useRootStore();

  const [tick, toggleTick] = useReducer(state => !state, false);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextFigureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Effects

  useEffect(() => {
    const canvas = gameCanvasRef.current;

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

  useEffect(() => {
    const canvas = nextFigureCanvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    const cellSize = GameControlHelper.getSceneSize().cellSize;
    const shape = gameControlStore.nextShape;

    const renderNextShape = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
          if (ctx && shape[i][j] !== 0) {
            const x = (0.5 + j) * cellSize;
            const y = (0.5 + i) * cellSize;

            // fill a current shape cell
            ctx.fillStyle = gameControlStore.nextShapeColor;
            ctx.fillRect(x, y, cellSize, cellSize);

            // draw a stroke around the current shape cell
            ctx.strokeStyle = '#000'; // Black stroke color
            ctx.lineWidth = 2; // Adjust the stroke width as needed
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }
    };

    renderNextShape();
  }, [gameControlStore.nextShape, gameControlStore.nextShapeColor]);

  // init game
  useEffect(() => {
    gameControlStore.initScene();
  }, []);

  useEffect(() => {
    if (gameControlStore.isGameOver) {
      return;
    }

    if (gameControlStore.isGamePaused) {
      return;
    }

    const intervalId = setInterval(() => {
      toggleTick();
    }, gameControlStore.tickRate);

    return () => clearInterval(intervalId);
  }, [gameControlStore.isGameOver, gameControlStore.isGamePaused, gameControlStore.tickRate]);

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

  const handlePausePress = () => {
    gameControlStore.toggleGamePause();
  };

  const handleResetPress = () => {
    gameControlStore.resetGame();
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      handlePausePress();
      return;
    }

    if (event.key === 'r') {
      handleResetPress();
      return;
    }

    if (!gameControlStore.isGamePaused) {
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
    <div style={styles.gameContainer}>
      <div style={styles.gameScene}>
        <canvas
          style={styles.canvas}
          ref={gameCanvasRef}
          width={GameControlHelper.getSceneSize().width}
          height={GameControlHelper.getSceneSize().height}
        />
        <div style={styles.infoContainer}>
          <h3>TOP: {gameControlStore.highScore}</h3>
          <h3>SCORE: {gameControlStore.score}</h3>
          <h3>NEXT SHAPE:</h3>
          <canvas
            ref={nextFigureCanvasRef}
            width={GameControlHelper.getSceneSize().cellSize * 5}
            height={GameControlHelper.getSceneSize().cellSize * 3}
          />
        </div>
      </div>
      {gameControlStore.isGamePaused ? (
        <div style={styles.pauseContainer}>
          <h3 className={'blink'}>PAUSED</h3>
        </div>
      ) : null}
      {gameControlStore.isGameOver ? (
        <div style={styles.gameOver}>
          <h2>Game Over</h2>
          <h2>Press R to restart</h2>
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
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginLeft: 16,
  },
  gameContainer: {
    paddingTop: 32,
    flex: 1,
  },
  gameScene: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
  },
  pauseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute' as const,
    bottom: '50%',
    width: '100%',
    height: 64,
    color: '#FFF',
    backgroundColor: '#000',
    alignSelf: 'center',
  },
};
