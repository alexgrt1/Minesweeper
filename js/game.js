const game = document.getElementById("game");
const rows = 10;
const cols = 10;
const bombsCount = 15;
let cells = [];

function createBoard() {
  // Reset
  game.innerHTML = "";
  cells = [];
  
  // Create cells
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    cell.addEventListener("contextmenu", handleRightClick);
    game.appendChild(cell);
    cells.push(cell);
  }

  // Plant bombs
  let bombPositions = new Set();
  while (bombPositions.size < bombsCount) {
    bombPositions.add(Math.floor(Math.random() * rows * cols));
  }

  bombPositions.forEach(index => {
    cells[index].dataset.bomb = "true";
  });

  // Set numbers
  cells.forEach((cell, i) => {
    if (cell.dataset.bomb === "true") return;

    const neighbors = getNeighbors(i);
    const count = neighbors.filter(n => n.dataset.bomb === "true").length;
    if (count > 0) {
      cell.dataset.count = count;
    }
  });
}

function getNeighbors(index) {
  const neighbors = [];
  const row = Math.floor(index / cols);
  const col = index % cols;

  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;

      const newRow = row + r;
      const newCol = col + c;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        neighbors.push(cells[newRow * cols + newCol]);
      }
    }
  }

  return neighbors;
}

function handleClick(e) {
  const cell = e.target;
  if (cell.classList.contains("revealed") || cell.classList.contains("flag")) return;

  if (cell.dataset.bomb === "true") {
    cell.classList.add("bomb");
    alert("¡BOOM! Perdiste");
    revealAll();
    return;
  }

  reveal(cell);
}

function handleRightClick(e) {
  e.preventDefault();
  const cell = e.target;
  if (cell.classList.contains("revealed")) return;
  cell.classList.toggle("flag");
}

function reveal(cell) {
  if (cell.classList.contains("revealed")) return;

  cell.classList.add("revealed");
  if (cell.dataset.count) {
    cell.textContent = cell.dataset.count;
  } else {
    const neighbors = getNeighbors(parseInt(cell.dataset.index));
    neighbors.forEach(reveal);
  }
}

function revealAll() {
  cells.forEach(cell => {
    if (cell.dataset.bomb === "true") {
      cell.classList.add("bomb");
    } else if (cell.dataset.count) {
      cell.textContent = cell.dataset.count;
    }
    cell.classList.add("revealed");
  });
}

document.getElementById("reset").addEventListener("click", createBoard);


createBoard();
