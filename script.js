const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const overlayEl = document.getElementById("overlay");
const messageEl = document.getElementById("message");
const restartButton = document.getElementById("restart");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialSpeed = 130;
const storageKey = "snake-high-score";

let snake;
let direction;
let nextDirection;
let food;
let score;
let highScore;
let gameLoopId;
let tickSpeed;
let started;
let gameOver;

function loadHighScore() {
  const storedValue = Number(localStorage.getItem(storageKey));
  highScore = Number.isFinite(storedValue) ? storedValue : 0;
  highScoreEl.textContent = String(highScore);
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  tickSpeed = initialSpeed;
  started = false;
  gameOver = false;
  scoreEl.textContent = "0";
  spawnFood();
  showOverlay("Pressione uma seta para começar");
  stopLoop();
  draw();
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function startLoop() {
  stopLoop();
  gameLoopId = window.setInterval(step, tickSpeed);
}

function stopLoop() {
  if (gameLoopId) {
    window.clearInterval(gameLoopId);
    gameLoopId = null;
  }
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  const willEat = head.x === food.x && head.y === food.y;

  if (hitWall(head) || hitSelf(head, willEat)) {
    finishGame();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 10;
    scoreEl.textContent = String(score);
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = String(highScore);
      localStorage.setItem(storageKey, String(highScore));
    }
    spawnFood();
    tickSpeed = Math.max(65, tickSpeed - 4);
    startLoop();
  } else {
    snake.pop();
  }

  draw();
}

function hitWall(head) {
  return head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
}

function hitSelf(head, willEat) {
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  return bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);
}

function finishGame() {
  gameOver = true;
  started = false;
  stopLoop();
  showOverlay(`Fim de jogo. Seu score foi ${score}`);
}

function showOverlay(message) {
  messageEl.textContent = message;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function setDirection(x, y) {
  if (gameOver) {
    return;
  }

  const isOpposite = direction.x === -x && direction.y === -y;
  if (isOpposite) {
    return;
  }

  nextDirection = { x, y };

  if (!started) {
    started = true;
    hideOverlay();
    startLoop();
  }
}

function drawBoard() {
  ctx.fillStyle = "#0b1120";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFood() {
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.roundRect(food.x * gridSize + 3, food.y * gridSize + 3, gridSize - 6, gridSize - 6, 6);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#86efac" : "#22c55e";
    ctx.beginPath();
    ctx.roundRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4, 6);
    ctx.fill();
  });
}

function draw() {
  drawBoard();
  drawFood();
  drawSnake();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") {
    setDirection(0, -1);
  } else if (key === "arrowdown" || key === "s") {
    setDirection(0, 1);
  } else if (key === "arrowleft" || key === "a") {
    setDirection(-1, 0);
  } else if (key === "arrowright" || key === "d") {
    setDirection(1, 0);
  } else if (key === "enter" && gameOver) {
    resetGame();
  }
});

restartButton.addEventListener("click", () => {
  resetGame();
});

loadHighScore();
resetGame();
