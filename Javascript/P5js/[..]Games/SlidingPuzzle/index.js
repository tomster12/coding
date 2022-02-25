
let directions = [
  [-1, 0],
  [0, -1],
  [1, 0],
  [0, 1]
]
let gridSize;
let target;
let grid;


function setup() {
  createCanvas(800, 800);
  textSize(40);
  textAlign(CENTER);
  noStroke();

  // Setup variables
  gridSize = 3;
  target = [];
  for (let i = 0, count = 0; i < gridSize; i++) {
    target.push([]);
    for (let o = 0; o < gridSize; o++, count++) {
      target[i].push(count);
    }
  }
  grid = target;

  // Randomize grid
  for (let i = 0; i < 20; i++) {
    let moves = getMoves(grid);
    if (moves.length == 0) break;
    grid = moveGrid(grid, moves[floor(random(moves.length))]);
  }

  // Solve
  print(solveRecursive(grid, 0));
}


function draw() {
  background(0);

  // Draw grid
  let sx = width / gridSize;
  let sy = height / gridSize;
  for (let i = 0; i < gridSize; i++) {
    for (let o = 0; o < gridSize; o++) {
      fill(255);
      let px = (o + 0.05) * sx;
      let py = (i + 0.05) * sy;
      rect(px, py, sx * 0.9, sy * 0.9);
      if (grid[i][o] != 0) {
        fill(0);
        text(grid[i][o],
          px + sx * 0.45,
          py + sy * 0.45 + 20
        );
      }
    }
  }
}


function keyPressed() {
  // Move the grid if the corresponding move is allowable
  let moves = getMoves(grid);
  if (keyCode == 37 && moves.includes(0)) grid = moveGrid(grid, 0);
  if (keyCode == 38 && moves.includes(1)) grid = moveGrid(grid, 1);
  if (keyCode == 39 && moves.includes(2)) grid = moveGrid(grid, 2);
  if (keyCode == 40 && moves.includes(3)) grid = moveGrid(grid, 3);
}


// Recursive, not efficient
function solveRecursive(grid, count) {
  if (count == 20) return null;
  let moves = getMoves(grid);
  if (moves.length == 0) return null;

  // Loop over all possibilities
  for (let i = 0; i < moves.length; i++) {
    let nextGrid = moveGrid(grid, moves[i]);

    // Check if found
    let found = true;
    for (let x = 0; x < nextGrid.length; x++) {
      for (let y = 0; y < nextGrid[x].length; y++) {
        if (nextGrid[x][y] != target[x][y]) {
          found = false;
          break;
        }
      }
    }
    if (found) return [moves[i]];

    // Check all possibilities of next grid
    let canSolve = solveRecursive(nextGrid, count + 1);
    if (canSolve != null) return [moves[i]].concat(canSolve);
  }

  // None of next moves can solve
  return null;
}


function getMoves(grid) {
  // Find the empty position
  let moves = [];
  let pos = getEmptyPosition(grid);

  // Check each tile around the empty position and add matching direction
  for (let i = 0; i < directions.length; i++) {
    let newPos = [pos[0] + directions[i][0], pos[1] + directions[i][1]];
    if (newPos[0] >= 0
      && newPos[0] < gridSize
      && newPos[1] >= 0
      && newPos[1] < gridSize) moves.push((i + 2) % 4);
  }
  return moves;
}


function moveGrid(grid, direction) {
  // Create a new grid using current grid
  let newGrid = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid.push([]);
    for (let o = 0; o < gridSize; o++) {
      newGrid[i].push(grid[i][o]);
    }
  }

  // Find the empty position position to swap with
  let pos = getEmptyPosition(newGrid);
  let dir = directions[(direction + 2) % 4];
  let swapWith = [pos[0] + dir[0], pos[1] + dir[1]];

  // Swap empty position with piece at swap position
  let temp = newGrid[swapWith[1]][swapWith[0]];
  newGrid[swapWith[1]][swapWith[0]] = newGrid[pos[1]][pos[0]];
  newGrid[pos[1]][pos[0]] = temp;
  return newGrid;
}


function getEmptyPosition(grid) {
  // Find the empty position in a grid
  let position = [-1, -1];
  for (let i = 0; i < gridSize; i++) {
    for (let o = 0; o < gridSize; o++) {
      if (grid[i][o] == 0) {
        position = [o, i];
        break;
      }
    }
  }
  return position;
}
