const game = document.getElementById("game");
const resetBtn = document.getElementById("reset");
const timerEl = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");
const flagsEl = document.getElementById("flags");

let rows = 10;
let cols = 10;
let bombsCount = 15;
let cells = [];
let timer;
let seconds = 0;
let gameStarted = false;
let flagsRemaining = bombsCount;
let firstClick = true;

// Sonidos
const clickSound = new Audio("assets/click.wav");
const flagSound = new Audio("assets/flag.wav");
const boomSound = new Audio("assets/boom.wav");

function updateDifficulty() {
    const level = difficultySelect.value;
    if (level === "easy") {
        rows = cols = 8;
        bombsCount = 10;
    } else if (level === "medium") {
        rows = cols = 10;
        bombsCount = 15;
    } else if (level === "hard") {
        rows = cols = 14;
        bombsCount = 30;
    }

    game.style.gridTemplateColumns = `repeat(${cols}, 34px)`;
}

function startTimer() {
    clearInterval(timer);
    seconds = 0;
    timerEl.textContent = "⏱ 00:00";
    timer = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = `⏱ ${m}:${s}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function updateFlagCounter() {
    flagsEl.textContent = `🚩 ${flagsRemaining}`;
}

function createBoard() {
    updateDifficulty();
    game.innerHTML = "";
    cells = [];
    stopTimer();
    gameStarted = false;
    flagsRemaining = bombsCount;
    updateFlagCounter();
    firstClick = true;


    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleClick);
        cell.addEventListener("contextmenu", handleRightClick);
        game.appendChild(cell);
        cells.push(cell);
    }

    
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

  if (firstClick) {
    firstClick = false;
    generateBombsExcluding(parseInt(cell.dataset.index));
    startTimer();
  }

  if (cell.dataset.bomb === "true") {
    boomSound.play();
    cell.classList.add("bomb");
    cell.textContent = "💣";
    revealAll();
    alert("💥 ¡BOOM! Has perdido.");
    stopTimer();
    return;
  }

  clickSound.play();
  reveal(cell);
}

function generateBombsExcluding(startIndex) {
  const excluded = new Set();
  excluded.add(startIndex);
  getNeighbors(startIndex).forEach(n => excluded.add(parseInt(n.dataset.index)));

  const bombPositions = new Set();
  while (bombPositions.size < bombsCount) {
    const rand = Math.floor(Math.random() * rows * cols);
    if (excluded.has(rand)) continue;
    bombPositions.add(rand);
  }

  bombPositions.forEach(i => (cells[i].dataset.bomb = "true"));

  // Calcula los números
  cells.forEach((cell, i) => {
    if (cell.dataset.bomb === "true") return;
    const neighbors = getNeighbors(i);
    const count = neighbors.filter(n => n.dataset.bomb === "true").length;
    if (count > 0) {
      cell.dataset.count = count;
    }
  });
}

function handleRightClick(e) {
    e.preventDefault();
    const cell = e.target;
    if (cell.classList.contains("revealed")) return;

    if (cell.classList.contains("flag")) {
        cell.classList.remove("flag");
        cell.textContent = "";
        flagsRemaining++;
    } else {
        if (flagsRemaining <= 0) return; // no más banderas
        cell.classList.add("flag");
        cell.textContent = "🚩";
        flagsRemaining--;
        flagSound.play();
    }

    updateFlagCounter();
}



function reveal(cell) {
    if (cell.classList.contains("revealed") || cell.classList.contains("flag")) return;

    cell.classList.add("revealed");

    if (cell.dataset.count) {
        cell.textContent = cell.dataset.count;
    } else {
        const neighbors = getNeighbors(parseInt(cell.dataset.index));
        neighbors.forEach(reveal);
    }

    // Victoria
    if (checkWin()) {
        alert("🎉 ¡Felicidades! Has ganado.");
        stopTimer();
        revealAll();
    }
}

function revealAll() {
    cells.forEach(cell => {
        if (cell.dataset.bomb === "true") {
            cell.classList.add("bomb");
            cell.textContent = "💣";
        } else if (cell.dataset.count) {
            cell.textContent = cell.dataset.count;
        }
        cell.classList.add("revealed");
    });
}

function checkWin() {
    return cells.filter(cell =>
        !cell.classList.contains("revealed") &&
        cell.dataset.bomb !== "true"
    ).length === 0;
}

// Listeners
resetBtn.addEventListener("click", createBoard);
difficultySelect.addEventListener("change", createBoard);

// Init
createBoard();
