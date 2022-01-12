import { rule18, rule86 } from "./rules";

const { rule30, rule110 } = require("./rules");
var canvas = <HTMLCanvasElement>document.getElementById("canvas");
const width = window.innerWidth * 5;
const height = window.innerHeight * 3;
const cellSize = 4;
const ctx = canvas.getContext("2d");

// @ts-ignore
canvas.width = width;
// @ts-ignore
canvas.height = height;

interface ruleInterface {
  "111": boolean;
  "110": boolean;
  "101": boolean;
  "100": boolean;
  "011": boolean;
  "010": boolean;
  "001": boolean;
  "000": boolean;
}

const buttons = {
  Rule18: rule18,
  Rule30: rule30,
  Rule110: rule110,
  Rule86: rule86,
};

Object.entries(buttons).forEach(([key, value]) => {
  const button = document.createElement("button");
  button.innerHTML = "Rule " + key.slice(4);
  button.addEventListener("click", () => {
    renderCA(value);
  });
  document.getElementById("ruleButtonContainer").appendChild(button);
});

function renderCA(rule: ruleInterface) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grid = Array(Math.floor(height / cellSize))
    .fill(null)
    .map(() => Array(Math.floor(width / cellSize)).fill(false));

  function applyRule(row: boolean[], rules: ruleInterface) {
    // Rule 110
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
    grid[y + 1] = applyRule(grid[y], rule);
  }
}

renderCA(rule30);
