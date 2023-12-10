import { useEffect, useMemo, useReducer, useRef } from 'react';
import { Colors } from '../styles/Colors';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../RootStore';
import { GameControlHelper } from '../logic/gameControl/helpers/GameControlHelper';

export const GameField = observer(() => {
  const { gameControlStore, p2pStore } = useRootStore();

  const [tick, toggleTick] = useReducer(state => !state, false);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const otherPlayerGameCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextFigureCanvasRef = useRef<HTMLCanvasElement>(null);

  const cellSize = GameControlHelper.getSceneSize().cellSize;

  const sceneSize = useMemo(
    () => ({
      width: GameControlHelper.getSceneSize().width,
      height: GameControlHelper.getSceneSize().height,
    }),
    [],
  );

  // Scene Logic

  const renderScene = (ctx: CanvasRenderingContext2D, scene: number[][]) => {
    ctx?.clearRect(0, 0, sceneSize.width, sceneSize.height);

    for (let i = 0; i < GameControlHelper.getSceneSize().rows; i++) {
      for (let j = 0; j < GameControlHelper.getSceneSize().cols; j++) {
        const cellValue = scene[i][j];

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
  };

  const renderShape = (ctx: CanvasRenderingContext2D, shape: number[][], col: number, row: number, color: string) => {
    for (let i = 0; i < shape?.length; i++) {
      for (let j = 0; j < shape[i]?.length; j++) {
        if (ctx && shape[i][j] !== 0) {
          const x = (col + j) * cellSize;
          const y = (row + i) * cellSize;

          // fill a current shape cell
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellSize, cellSize);

          // draw a stroke around the current shape cell
          ctx.strokeStyle = '#000'; // Black stroke color
          ctx.lineWidth = 2; // Adjust the stroke width as needed
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  };

  // Player scene
  useEffect(() => {
    const ctx = gameCanvasRef.current?.getContext('2d');

    if (!ctx) {
      return;
    }

    renderScene(ctx, gameControlStore.scene);
    renderShape(
      ctx,
      gameControlStore.currentShape,
      gameControlStore.currentCol,
      gameControlStore.currentRow,
      gameControlStore.currentShapeColor,
    );
  }, [
    gameControlStore.scene,
    gameControlStore.currentShape,
    gameControlStore.currentShapeColor,
    gameControlStore.currentRow,
    gameControlStore.currentCol,
  ]);

  // Other player scene
  useEffect(() => {
    const ctx = otherPlayerGameCanvasRef.current?.getContext('2d');

    if (!ctx || !gameControlStore.otherPlayerState?.scene[0]?.length) {
      return;
    }

    renderScene(ctx, gameControlStore.otherPlayerState.scene);
    renderShape(
      ctx,
      gameControlStore.otherPlayerState?.currentShape,
      gameControlStore.otherPlayerState?.currentCol,
      gameControlStore.otherPlayerState?.currentRow,
      gameControlStore.otherPlayerState?.currentShapeColor,
    );
  }, [gameControlStore.otherPlayerState]);

  // Player's next shape
  useEffect(() => {
    const nextShapeCanvas = nextFigureCanvasRef.current;

    if (!nextShapeCanvas) {
      return;
    }

    const ctx = nextShapeCanvas.getContext('2d');
    const shape = gameControlStore.nextShape;

    const renderNextShape = () => {
      ctx?.clearRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);

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

  // Game Logic

  useEffect(() => {
    if (p2pStore.connection) {
      gameControlStore.initScene();
    }
  }, [p2pStore.connection]);

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
    p2pStore.sendMessage({
      otherPlayer: {
        scene: gameControlStore.scene,
        currentShape: gameControlStore.currentShape,
        currentCol: gameControlStore.currentCol,
        currentRow: gameControlStore.currentRow,
        currentShapeColor: gameControlStore.currentShapeColor,
        score: gameControlStore.score,
      },
    });
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
        <canvas style={styles.canvas} ref={gameCanvasRef} width={sceneSize.width} height={sceneSize.height} />
        <div style={styles.infoContainer}>
          <h3>TOP: {gameControlStore.highScore}</h3>
          <h3>SCORE: {gameControlStore.score}</h3>
          <h3>OTHER PLAYER SCORE: {gameControlStore.otherPlayerState.score}</h3>
          <h3>NEXT SHAPE:</h3>
          <canvas ref={nextFigureCanvasRef} width={cellSize * 5} height={cellSize * 3} />
        </div>
        <div style={{ marginLeft: 16 }}>
          <canvas
            style={styles.canvas}
            ref={otherPlayerGameCanvasRef}
            width={sceneSize.width}
            height={sceneSize.height}
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
    minWidth: 260,
    marginRight: 16,
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
