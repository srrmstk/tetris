export class GameControlHelper {
  static getSceneSize = () => {
    return {
      rows: 20,
      cols: 10,
      cellSize: 30,
      width: 10 * 30,
      height: 20 * 30,
    };
  };

  static getFigureShapes = () => {
    return [
      [[1, 1, 1, 1]],
      [
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
    ];
  };
}
