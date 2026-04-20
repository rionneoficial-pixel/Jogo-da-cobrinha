const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const summaryCharacter = document.getElementById("summary-character");
const summaryPower = document.getElementById("summary-power");
const summaryBiome = document.getElementById("summary-biome");
const summaryLife = document.getElementById("summary-life");
const summaryMonsters = document.getElementById("summary-monsters");
const summaryGoal = document.getElementById("summary-goal");
const biomeTitle = document.getElementById("biome-title");
const biomeDescription = document.getElementById("biome-description");
const playerAvatar = document.getElementById("player-avatar");
const playerName = document.getElementById("player-name");
const playerPower = document.getElementById("player-power");
const playerLifeFill = document.getElementById("player-life-fill");
const playerLifeText = document.getElementById("player-life-text");
const battleLog = document.getElementById("battle-log");
const attackButton = document.getElementById("attack-button");
const restartButton = document.getElementById("restart-button");
const characterOverlay = document.getElementById("character-overlay");
const powerOverlay = document.getElementById("power-overlay");
const messageOverlay = document.getElementById("message-overlay");
const messageStep = document.getElementById("message-step");
const messageTitle = document.getElementById("message-title");
const messageBody = document.getElementById("message-body");
const messageButton = document.getElementById("message-button");

const tileSize = 48;
const cols = canvas.width / tileSize;
const rows = canvas.height / tileSize;

const characters = {
  mulher: { name: "Luna", avatar: "🧝‍♀️", maxLife: 100, color: "#ffd6a5" },
  homem: { name: "Kael", avatar: "🧙‍♂️", maxLife: 100, color: "#d7c6ff" }
};

const powers = {
  fogo: { name: "Fogo", icon: "🔥", damageMin: 18, damageMax: 28, heal: 0, color: "#ff7b54" },
  agua: { name: "Agua", icon: "💧", damageMin: 14, damageMax: 22, heal: 5, color: "#58c4f6" },
  vento: { name: "Vento", icon: "🌪️", damageMin: 15, damageMax: 24, heal: 0, color: "#9ae6b4", range: 2 }
};

const biomeInfo = {
  floresta: {
    name: "Floresta Viva",
    description: "Arvores antigas, grama vibrando e monstros escondidos entre as folhas.",
    ground: "#2f6f49",
    accent: "#4f9f60",
    detail: "#1b4332",
    sky: "#9ad1a7"
  },
  deserto: {
    name: "Deserto Escaldante",
    description: "Areia quente, ruinas soterradas e criaturas agressivas no calor.",
    ground: "#d9a441",
    accent: "#efc46f",
    detail: "#b7791f",
    sky: "#ffd79a"
  },
  lago: {
    name: "Lago Cristalino",
    description: "Agua brilhante, ilhotas e criaturas magicas protegendo o caminho.",
    ground: "#2d6a9f",
    accent: "#5eb8ff",
    detail: "#184e77",
    sky: "#9adfff"
  },
  ruinas: {
    name: "Ruinas Antigas",
    description: "Pedras partidas, totens esquecidos e o chefe final guardando o templo.",
    ground: "#6d6875",
    accent: "#a5a58d",
    detail: "#4a4e69",
    sky: "#c7b7d8"
  }
};

const blockedTiles = new Set([
  "1,1", "2,1", "1,2",
  "5,2", "6,2", "5,3",
  "8,1", "9,1", "10,1", "9,2", "8,4", "10,5", "9,8",
  "13,2", "14,2", "13,8", "14,8"
]);

const decorations = [
  { x: 1, y: 1, type: "tree" },
  { x: 2, y: 1, type: "tree" },
  { x: 1, y: 2, type: "tree" },
  { x: 3, y: 7, type: "bush" },
  { x: 5, y: 2, type: "cactus" },
  { x: 6, y: 2, type: "cactus" },
  { x: 5, y: 3, type: "cactus" },
  { x: 7, y: 9, type: "bones" },
  { x: 8, y: 1, type: "water" },
  { x: 9, y: 1, type: "water" },
  { x: 10, y: 1, type: "water" },
  { x: 9, y: 2, type: "water" },
  { x: 8, y: 4, type: "water" },
  { x: 10, y: 5, type: "water" },
  { x: 9, y: 8, type: "water" },
  { x: 11, y: 8, type: "crystal" },
  { x: 13, y: 2, type: "pillar" },
  { x: 14, y: 2, type: "pillar" },
  { x: 13, y: 8, type: "pillar" },
  { x: 14, y: 8, type: "pillar" },
  { x: 15, y: 5, type: "altar" }
];

const baseMonsterSpawns = [
  { id: "slime", name: "Slime Sombrio", avatar: "🟢", x: 2, y: 5, life: 30, attackMin: 6, attackMax: 10, biome: "floresta", color: "#8ac926" },
  { id: "bat", name: "Morcego Noturno", avatar: "🦇", x: 3, y: 9, life: 26, attackMin: 5, attackMax: 8, biome: "floresta", color: "#7b2cbf" },
  { id: "scorpion", name: "Escorpiao de Areia", avatar: "🦂", x: 6, y: 5, life: 34, attackMin: 7, attackMax: 11, biome: "deserto", color: "#f77f00" },
  { id: "wolf", name: "Lobo Corrompido", avatar: "🐺", x: 7, y: 8, life: 38, attackMin: 8, attackMax: 12, biome: "deserto", color: "#adb5bd" },
  { id: "sprite", name: "Espírito da Agua", avatar: "🪼", x: 10, y: 3, life: 36, attackMin: 7, attackMax: 10, biome: "lago", color: "#48cae4" },
  { id: "serpent", name: "Serpente do Lago", avatar: "🐍", x: 11, y: 7, life: 40, attackMin: 8, attackMax: 12, biome: "lago", color: "#00b4d8" },
  { id: "skeleton", name: "Caveira Viva", avatar: "💀", x: 13, y: 5, life: 42, attackMin: 8, attackMax: 12, biome: "ruinas", color: "#d6ccc2" },
  { id: "golem", name: "Guardiao de Pedra", avatar: "🗿", x: 14, y: 6, life: 48, attackMin: 9, attackMax: 13, biome: "ruinas", color: "#adb5bd" },
  { id: "boss", name: "Rei dos Monstros", avatar: "👹", x: 15, y: 4, life: 72, attackMin: 12, attackMax: 18, biome: "ruinas", color: "#ff4d6d" }
];

const state = {
  selectedCharacter: null,
  selectedPower: null,
  life: 100,
  player: {
    x: 0,
    y: 0,
    renderX: 0,
    renderY: 0,
    facingX: 1,
    facingY: 0
  },
  monsters: [],
  activeBiome: "floresta",
  pressedKeys: new Set(),
  lastMoveAt: 0,
  moveDelay: 150,
  started: false,
  gameOver: false,
  win: false,
  effects: [],
  messageAction: null,
  audioContext: null,
  audioReady: false,
  lastBiomeSound: "",
  biomePulseAt: 0
};

function cloneMonsters() {
  return baseMonsterSpawns.map((monster) => ({ ...monster, maxLife: monster.life, alive: true, hurtUntil: 0 }));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBiomeAt(x) {
  if (x <= 3) {
    return "floresta";
  }
  if (x <= 7) {
    return "deserto";
  }
  if (x <= 11) {
    return "lago";
  }
  return "ruinas";
}

function isInside(x, y) {
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

function isBlocked(x, y) {
  return blockedTiles.has(`${x},${y}`);
}

function isOccupiedByMonster(x, y) {
  return state.monsters.some((monster) => monster.alive && monster.x === x && monster.y === y);
}

function addLog(message, highlight = false) {
  const entry = document.createElement("p");
  entry.className = `log-entry${highlight ? " highlight" : ""}`;
  entry.textContent = message;
  battleLog.prepend(entry);
}

function showOverlay(overlay) {
  [characterOverlay, powerOverlay, messageOverlay].forEach((element) => {
    if (element === overlay) {
      element.classList.remove("hidden");
      element.classList.add("active");
    } else {
      element.classList.add("hidden");
      element.classList.remove("active");
    }
  });
}

function hideAllOverlays() {
  [characterOverlay, powerOverlay, messageOverlay].forEach((element) => {
    element.classList.add("hidden");
    element.classList.remove("active");
  });
}

function showMessage(step, title, body, buttonText, action) {
  messageStep.textContent = step;
  messageTitle.textContent = title;
  messageBody.textContent = body;
  messageButton.textContent = buttonText;
  state.messageAction = action;
  showOverlay(messageOverlay);
}

function ensureAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return null;
  }

  if (!state.audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioCtor();
  }

  if (state.audioContext.state === "suspended") {
    state.audioContext.resume();
  }

  state.audioReady = true;
  return state.audioContext;
}

function playTone(frequency, duration, type, volume, glideTo) {
  const audio = ensureAudio();
  if (!audio) {
    return;
  }

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  if (glideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(glideTo, audio.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

function playMoveSound() {
  playTone(240, 0.06, "square", 0.025, 180);
}

function playAttackSound() {
  if (!state.selectedPower) {
    return;
  }

  if (state.selectedPower.name === "Fogo") {
    playTone(280, 0.18, "sawtooth", 0.05, 110);
  } else if (state.selectedPower.name === "Agua") {
    playTone(440, 0.16, "sine", 0.04, 280);
  } else {
    playTone(520, 0.12, "triangle", 0.04, 720);
  }
}

function playHitSound() {
  playTone(180, 0.09, "square", 0.035, 90);
}

function playBiomeSound(biome) {
  if (state.lastBiomeSound === biome) {
    return;
  }

  state.lastBiomeSound = biome;

  if (biome === "floresta") {
    playTone(510, 0.14, "triangle", 0.03, 640);
  } else if (biome === "deserto") {
    playTone(260, 0.16, "sawtooth", 0.03, 200);
  } else if (biome === "lago") {
    playTone(430, 0.2, "sine", 0.03, 300);
  } else {
    playTone(220, 0.22, "square", 0.025, 170);
  }
}

function playWinSound() {
  playTone(440, 0.14, "triangle", 0.04, 660);
  window.setTimeout(() => playTone(660, 0.2, "triangle", 0.04, 880), 120);
}

function playLoseSound() {
  playTone(220, 0.2, "sawtooth", 0.045, 110);
}

function updateBiomeInfo() {
  const biome = biomeInfo[state.activeBiome];
  summaryBiome.textContent = biome.name;
  biomeTitle.textContent = biome.name;
  biomeDescription.textContent = biome.description;
}

function updateSummary() {
  summaryCharacter.textContent = state.selectedCharacter ? state.selectedCharacter.name : "Nao escolhido";
  summaryPower.textContent = state.selectedPower ? state.selectedPower.name : "Nao escolhido";
  summaryLife.textContent = state.selectedCharacter ? `${Math.max(0, state.life)} / ${state.selectedCharacter.maxLife}` : "100 / 100";
  summaryMonsters.textContent = String(state.monsters.filter((monster) => monster.alive).length);

  if (!state.selectedCharacter) {
    summaryGoal.textContent = "Escolher heroi";
  } else if (!state.selectedPower) {
    summaryGoal.textContent = "Escolher poder";
  } else if (state.win) {
    summaryGoal.textContent = "Mapa salvo";
  } else if (state.gameOver) {
    summaryGoal.textContent = "Tentar de novo";
  } else {
    summaryGoal.textContent = "Derrotar todos";
  }
}

function updatePlayerCard() {
  if (!state.selectedCharacter) {
    return;
  }

  playerAvatar.textContent = state.selectedCharacter.avatar;
  playerName.textContent = state.selectedCharacter.name;
  playerPower.textContent = state.selectedPower
    ? `Poder: ${state.selectedPower.name} ${state.selectedPower.icon}`
    : "Poder: Escolha um elemento";
  const lifePercent = Math.max(0, (state.life / state.selectedCharacter.maxLife) * 100);
  playerLifeFill.style.width = `${lifePercent}%`;
  playerLifeText.textContent = `${Math.max(0, state.life)} / ${state.selectedCharacter.maxLife}`;
}

function updateActionState() {
  attackButton.disabled = !state.started || state.gameOver || !getAttackableMonster();
}

function createEffect(type, x, y, color) {
  state.effects.push({
    type,
    x,
    y,
    color,
    startedAt: performance.now(),
    duration: type === "impact" ? 240 : 320
  });
}

function chooseCharacter(key, button) {
  ensureAudio();
  state.selectedCharacter = characters[key];
  state.life = state.selectedCharacter.maxLife;
  document.querySelectorAll("[data-character]").forEach((element) => {
    element.classList.toggle("selected", element === button);
  });
  updateSummary();
  updatePlayerCard();
  showOverlay(powerOverlay);
}

function choosePower(key, button) {
  ensureAudio();
  state.selectedPower = powers[key];
  document.querySelectorAll("[data-power]").forEach((element) => {
    element.classList.toggle("selected", element === button);
  });
  updateSummary();
  updatePlayerCard();
  showMessage(
    "Aventura",
    "Explore o mapa",
    "Caminhe pelos ambientes, encontre os monstros e ataque quando estiver ao lado deles. O chefe final espera nas ruinas.",
    "Comecar",
    () => {
      hideAllOverlays();
      state.started = true;
      addLog("A aventura comecou. Explore o mapa e derrote os monstros.", true);
      updateActionState();
    }
  );
}

function resetGame() {
  state.selectedCharacter = null;
  state.selectedPower = null;
  state.life = 100;
  state.started = false;
  state.gameOver = false;
  state.win = false;
  state.monsters = cloneMonsters();
  state.player.x = 0;
  state.player.y = 5;
  state.player.renderX = 0;
  state.player.renderY = 5;
  state.player.facingX = 1;
  state.player.facingY = 0;
  state.activeBiome = getBiomeAt(state.player.x);
  state.effects = [];
  state.lastBiomeSound = "";
  battleLog.innerHTML = "";
  addLog("Escolha um personagem para iniciar sua aventura.");
  document.querySelectorAll("[data-character], [data-power]").forEach((element) => {
    element.classList.remove("selected");
  });
  updateSummary();
  updatePlayerCard();
  updateBiomeInfo();
  updateActionState();
  showOverlay(characterOverlay);
}

function getMonsterAt(x, y) {
  return state.monsters.find((monster) => monster.alive && monster.x === x && monster.y === y);
}

function getAttackableMonster() {
  if (!state.selectedPower) {
    return null;
  }

  const range = state.selectedPower.range || 1;
  for (let step = 1; step <= range; step += 1) {
    const targetX = state.player.x + state.player.facingX * step;
    const targetY = state.player.y + state.player.facingY * step;
    const monster = getMonsterAt(targetX, targetY);
    if (monster) {
      return monster;
    }
  }

  return state.monsters.find((monster) => {
    if (!monster.alive) {
      return false;
    }
    const distance = Math.abs(monster.x - state.player.x) + Math.abs(monster.y - state.player.y);
    return distance === 1;
  }) || null;
}

function movePlayer(dx, dy, now) {
  if (!state.started || state.gameOver || !state.selectedCharacter || !state.selectedPower) {
    return;
  }

  if (now - state.lastMoveAt < state.moveDelay) {
    return;
  }

  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;
  state.player.facingX = dx;
  state.player.facingY = dy;

  if (!isInside(nextX, nextY) || isBlocked(nextX, nextY) || isOccupiedByMonster(nextX, nextY)) {
    state.lastMoveAt = now;
    addLog("O caminho esta bloqueado.");
    updateActionState();
    return;
  }

  state.player.x = nextX;
  state.player.y = nextY;
  state.lastMoveAt = now;
  state.activeBiome = getBiomeAt(nextX);
  state.biomePulseAt = now;
  updateBiomeInfo();
  updateSummary();
  updateActionState();
  playMoveSound();
  playBiomeSound(state.activeBiome);
  maybeMonsterTurn(false);
}

function attackMonster() {
  if (!state.started || state.gameOver) {
    return;
  }

  const target = getAttackableMonster();
  if (!target) {
    addLog("Aproxime-se de um monstro e aponte para ele antes de atacar.");
    updateActionState();
    return;
  }

  let damage = randomBetween(state.selectedPower.damageMin, state.selectedPower.damageMax);
  if (target.id === "boss") {
    damage = Math.max(10, damage - 3);
  }

  target.life -= damage;
  target.hurtUntil = performance.now() + 220;
  createEffect("impact", target.x, target.y, state.selectedPower.color);
  addLog(`${state.selectedCharacter.name} usou ${state.selectedPower.name} e causou ${damage} em ${target.name}.`, true);
  playAttackSound();

  if (state.selectedPower.heal) {
    state.life = Math.min(state.selectedCharacter.maxLife, state.life + state.selectedPower.heal);
    addLog(`${state.selectedPower.name} recuperou ${state.selectedPower.heal} de energia.`);
  }

  if (target.life <= 0) {
    target.alive = false;
    target.life = 0;
    addLog(`${target.name} foi derrotado.`, true);
    createEffect("burst", target.x, target.y, target.color);
  }

  updateSummary();
  updatePlayerCard();
  updateActionState();

  if (state.monsters.every((monster) => !monster.alive)) {
    handleWin();
    return;
  }

  maybeMonsterTurn(true);
}

function maybeMonsterTurn(afterAttack) {
  if (state.gameOver || state.win) {
    return;
  }

  const adjacentMonsters = state.monsters.filter((monster) => {
    if (!monster.alive) {
      return false;
    }
    const distance = Math.abs(monster.x - state.player.x) + Math.abs(monster.y - state.player.y);
    return distance === 1;
  });

  if (adjacentMonsters.length === 0) {
    if (afterAttack) {
      moveMonstersCloser();
    }
    return;
  }

  let totalDamage = 0;
  adjacentMonsters.forEach((monster) => {
    const damage = randomBetween(monster.attackMin, monster.attackMax);
    totalDamage += damage;
    addLog(`${monster.name} contra-atacou e tirou ${damage} de vida.`);
    createEffect("impact", state.player.x, state.player.y, "#ffffff");
  });

  state.life -= totalDamage;
  playHitSound();
  updateSummary();
  updatePlayerCard();

  if (state.life <= 0) {
    handleLose();
    return;
  }

  if (afterAttack) {
    moveMonstersCloser();
  }
}

function moveMonstersCloser() {
  const occupied = new Set(
    state.monsters
      .filter((monster) => monster.alive)
      .map((monster) => `${monster.x},${monster.y}`)
  );

  state.monsters.forEach((monster) => {
    if (!monster.alive) {
      return;
    }

    const distance = Math.abs(monster.x - state.player.x) + Math.abs(monster.y - state.player.y);
    if (distance <= 1 || distance > 4) {
      return;
    }

    if (Math.random() > 0.65) {
      return;
    }

    occupied.delete(`${monster.x},${monster.y}`);

    const options = [
      { x: monster.x + Math.sign(state.player.x - monster.x), y: monster.y },
      { x: monster.x, y: monster.y + Math.sign(state.player.y - monster.y) }
    ];

    const nextStep = options.find((option) => {
      if (!isInside(option.x, option.y) || isBlocked(option.x, option.y)) {
        return false;
      }
      if (option.x === state.player.x && option.y === state.player.y) {
        return false;
      }
      return !occupied.has(`${option.x},${option.y}`);
    });

    if (nextStep) {
      monster.x = nextStep.x;
      monster.y = nextStep.y;
    }

    occupied.add(`${monster.x},${monster.y}`);
  });

  updateActionState();
}

function handleWin() {
  state.win = true;
  state.gameOver = true;
  updateSummary();
  updateActionState();
  playWinSound();
  showMessage(
    "Vitoria",
    "Mapa salvo",
    "Voce atravessou todos os ambientes, derrotou o Rei dos Monstros e libertou as ruinas antigas.",
    "Jogar novamente",
    resetGame
  );
}

function handleLose() {
  state.life = 0;
  state.gameOver = true;
  updateSummary();
  updatePlayerCard();
  updateActionState();
  playLoseSound();
  showMessage(
    "Derrota",
    "Seu heroi caiu",
    "Os monstros venceram desta vez. Reinicie a aventura para explorar o mapa novamente.",
    "Tentar novamente",
    resetGame
  );
}

function drawBackground(time) {
  const currentBiome = biomeInfo[state.activeBiome];
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, currentBiome.sky);
  gradient.addColorStop(1, "#0e1323");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const biome = biomeInfo[getBiomeAt(x)];
      const tileX = x * tileSize;
      const tileY = y * tileSize;
      const pulse = Math.sin(time / 400 + x * 0.6 + y * 0.4) * 3;

      ctx.fillStyle = biome.ground;
      ctx.fillRect(tileX, tileY, tileSize, tileSize);

      ctx.fillStyle = biome.accent;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(tileX + 4, tileY + 4 + pulse * 0.1, tileSize - 8, tileSize - 8);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }
}

function drawDecorations(time) {
  decorations.forEach((item) => {
    const x = item.x * tileSize;
    const y = item.y * tileSize;
    const bob = Math.sin(time / 350 + item.x) * 3;

    if (item.type === "tree") {
      ctx.fillStyle = "#3a5a40";
      ctx.fillRect(x + 18, y + 28, 12, 16);
      ctx.beginPath();
      ctx.fillStyle = "#74c69d";
      ctx.arc(x + 24, y + 20 + bob * 0.2, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === "bush") {
      ctx.fillStyle = "#95d5b2";
      ctx.beginPath();
      ctx.arc(x + 24, y + 30 + bob * 0.2, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === "cactus") {
      ctx.fillStyle = "#588157";
      ctx.fillRect(x + 18, y + 10, 12, 28);
      ctx.fillRect(x + 10, y + 18, 8, 10);
      ctx.fillRect(x + 30, y + 22, 8, 10);
    } else if (item.type === "bones") {
      ctx.strokeStyle = "#fefae0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 20);
      ctx.lineTo(x + 34, y + 32);
      ctx.moveTo(x + 34, y + 20);
      ctx.lineTo(x + 14, y + 32);
      ctx.stroke();
    } else if (item.type === "water") {
      ctx.fillStyle = "#5ec8ff";
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 6 + bob * 0.15, tileSize - 6, tileSize - 10, 14);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (item.type === "crystal") {
      ctx.fillStyle = "#90e0ef";
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 8);
      ctx.lineTo(x + 34, y + 26 + bob * 0.2);
      ctx.lineTo(x + 24, y + 40);
      ctx.lineTo(x + 14, y + 26 + bob * 0.2);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === "pillar") {
      ctx.fillStyle = "#adb5bd";
      ctx.fillRect(x + 14, y + 8, 20, 32);
      ctx.fillStyle = "#6c757d";
      ctx.fillRect(x + 10, y + 6, 28, 6);
    } else if (item.type === "altar") {
      ctx.fillStyle = "#cdb4db";
      ctx.fillRect(x + 8, y + 18, 32, 20);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(x + 18, y + 8 + bob * 0.2, 12, 10);
    }
  });
}

function drawMonsters(time) {
  state.monsters.forEach((monster) => {
    if (!monster.alive) {
      return;
    }

    const centerX = monster.x * tileSize + tileSize / 2;
    const centerY = monster.y * tileSize + tileSize / 2 + Math.sin(time / 300 + monster.x) * 3;
    const hurt = monster.hurtUntil > time;

    ctx.save();
    if (hurt) {
      ctx.translate(centerX, centerY);
      ctx.rotate(Math.sin(time / 30) * 0.08);
      ctx.translate(-centerX, -centerY);
    }

    ctx.fillStyle = monster.color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(monster.avatar, centerX, centerY + 10);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(centerX - 18, centerY + 18, 36, 6);
    ctx.fillStyle = "#80ed99";
    ctx.fillRect(centerX - 18, centerY + 18, 36 * (monster.life / monster.maxLife), 6);
    ctx.restore();
  });
}

function drawPlayer(time) {
  const targetRenderX = state.player.x;
  const targetRenderY = state.player.y;
  state.player.renderX += (targetRenderX - state.player.renderX) * 0.28;
  state.player.renderY += (targetRenderY - state.player.renderY) * 0.28;

  const centerX = state.player.renderX * tileSize + tileSize / 2;
  const centerY = state.player.renderY * tileSize + tileSize / 2;
  const bounce = Math.sin(time / 110) * 1.6;

  ctx.fillStyle = state.selectedPower ? state.selectedPower.color : "#ffd166";
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = state.selectedCharacter ? state.selectedCharacter.color : "#ffffff";
  ctx.beginPath();
  ctx.arc(centerX, centerY - 2 + bounce, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#231942";
  ctx.beginPath();
  ctx.arc(centerX, centerY - 6 + bounce, 3, 0, Math.PI * 2);
  ctx.arc(centerX + 8, centerY - 6 + bounce, 3, 0, Math.PI * 2);
  ctx.fill();

  const facingIndicatorX = centerX + state.player.facingX * 14;
  const facingIndicatorY = centerY + state.player.facingY * 14 + bounce;
  ctx.fillStyle = state.selectedPower ? state.selectedPower.color : "#ffd166";
  ctx.beginPath();
  ctx.arc(facingIndicatorX, facingIndicatorY, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawEffects(time) {
  state.effects = state.effects.filter((effect) => time - effect.startedAt < effect.duration);

  state.effects.forEach((effect) => {
    const age = time - effect.startedAt;
    const progress = age / effect.duration;
    const centerX = effect.x * tileSize + tileSize / 2;
    const centerY = effect.y * tileSize + tileSize / 2;

    ctx.save();
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = effect.color;
    ctx.globalAlpha = 1 - progress;

    if (effect.type === "impact") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10 + progress * 22, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6 + progress * 0.8;
        const px = centerX + Math.cos(angle) * progress * 26;
        const py = centerY + Math.sin(angle) * progress * 26;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  });
}

function drawHudHints() {
  if (!state.started || state.gameOver) {
    return;
  }

  const target = getAttackableMonster();
  if (!target) {
    return;
  }

  const x = target.x * tileSize + 4;
  const y = target.y * tileSize + 4;
  ctx.strokeStyle = state.selectedPower.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, tileSize - 8, tileSize - 8);
}

function render(time) {
  drawBackground(time);
  drawDecorations(time);
  drawMonsters(time);
  drawPlayer(time);
  drawEffects(time);
  drawHudHints();
  requestAnimationFrame(render);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
    event.preventDefault();
  }

  if (key === " ") {
    ensureAudio();
    attackMonster();
    return;
  }

  state.pressedKeys.add(key);
}

function handleKeyUp(event) {
  state.pressedKeys.delete(event.key.toLowerCase());
}

function processMovement(now) {
  if (state.pressedKeys.has("arrowup") || state.pressedKeys.has("w")) {
    movePlayer(0, -1, now);
  } else if (state.pressedKeys.has("arrowdown") || state.pressedKeys.has("s")) {
    movePlayer(0, 1, now);
  } else if (state.pressedKeys.has("arrowleft") || state.pressedKeys.has("a")) {
    movePlayer(-1, 0, now);
  } else if (state.pressedKeys.has("arrowright") || state.pressedKeys.has("d")) {
    movePlayer(1, 0, now);
  }

  requestAnimationFrame(processMovement);
}

document.querySelectorAll("[data-character]").forEach((button) => {
  button.addEventListener("click", () => chooseCharacter(button.dataset.character, button));
});

document.querySelectorAll("[data-power]").forEach((button) => {
  button.addEventListener("click", () => choosePower(button.dataset.power, button));
});

messageButton.addEventListener("click", () => {
  ensureAudio();
  if (typeof state.messageAction === "function") {
    const action = state.messageAction;
    state.messageAction = null;
    action();
  }
});

attackButton.addEventListener("click", () => {
  ensureAudio();
  attackMonster();
});

restartButton.addEventListener("click", resetGame);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

resetGame();
requestAnimationFrame(render);
requestAnimationFrame(processMovement);
