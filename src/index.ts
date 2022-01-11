var canvas = <HTMLCanvasElement>document.getElementById("canvas");
const width = window.innerWidth * 5;
const height = window.innerHeight * 3;
const cellSize = 4;
// @ts-ignore:
canvas.width = width;
// @ts-ignore:
canvas.height = height;
const ctx = canvas.getContext("2d");

const grid = Array(Math.floor(height / cellSize))
  .fill(null)
  .map(() => Array(Math.floor(width / cellSize)).fill(false));

function rule(row: boolean[]) {
  // Rule 30
  const rules = {
    "111": false,
    "110": false,
    "101": false,
    "100": true,
    "011": true,
    "010": true,
    "001": true,
    "000": false,
  };

  // Rule 110
  // const rules = {
  //   "111": false,
  //   "110": true,
  //   "101": true,
  //   "100": false,
  //   "011": true,
  //   "010": true,
  //   "001": true,
  //   "000": false
  // }
  const arr = Array(row.length).fill(false);
  for (let i = 1; i < row.length - 1; i++) {
    arr[i] =
      rules[
        row
          .slice(i - 1, i + 2)
          .map((x) => (x ? "1" : "0"))
          .join("")
      ];
  }
  return arr;
}
grid[0][Math.floor(grid[0].length / 2)] = true;
for (let y = 0; y < grid.length - 1; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    if (grid[y][x])
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
  grid[y + 1] = rule(grid[y]);
}
