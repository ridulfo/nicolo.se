var canvas = document.getElementById("canvas");
width = window.innerWidth * 5;
height = window.innerHeight * 3;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
const cellSize = 5;
// Create a grid the size of the window/cellSize
const grid = Array(parseInt(height / cellSize))
  .fill()
  .map(() => Array(parseInt(width / cellSize)).fill(false));
console.log(grid);
function rule(row) {
  // Rule 30
  const rules = {
    111: false,
    110: false,
    101: false,
    100: true,
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
    toString = row
      .slice(i - 1, i + 2)
      .map((x) => (x ? "1" : "0"))
      .join("");
    arr[i] = rules[toString];
  }
  return arr;
}
grid[0][parseInt(grid[0].length / 2)] = true;
for (let y = 0; y < grid.length - 1; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    if (grid[y][x])
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
  grid[y + 1] = rule(grid[y]);
}
