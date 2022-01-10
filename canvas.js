var canvas = document.getElementById("canvas");
width = window.innerWidth * 2;
height = window.innerHeight * 10;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
const gridSize = 300;
const grid = Array(height)
  .fill()
  .map(() => Array(gridSize).fill(false));
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
grid[0][gridSize / 2] = true;
for (let y = 0; y < grid.length-1; y++) {
  for (let x = 0; x < gridSize; x++) {
    if (grid[y][x])
    ctx.fillRect(
      (x * width) / gridSize,
      (y * width) / gridSize,
      width / gridSize,
      width / gridSize
      );
    }
    grid[y+1] = rule(grid[y]);
}
