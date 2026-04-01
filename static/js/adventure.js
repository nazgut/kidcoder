/* ==========================================================
   KidCoder – Adventure Module (v4 – REAL DUNGEON GAME)
   A grid-based dungeon crawler where the kid moves a hero
   through rooms, collects gems, dodges monsters & traps,
   finds keys to open doors. Arrow keys / swipe / on-screen
   buttons for controls. NO quizzes, NO multiple choice.
   ========================================================== */

/* ============ LEVEL DATA ============ */
/* Tile legend:
     .  = floor           #  = wall          P = player start
     G  = gem (yellow)    D  = diamond (blue, 2 pts)
     K  = key             L  = locked door
     E  = exit            M  = monster (paces)
     T  = trap (spikes)   H  = heart (extra life)
*/

const ADV_LEVELS = [
  {
    id: 1, name: "Pierwsza Jaskinia", icon: "🕯️", coins: 10,
    lives: 3, gemsNeeded: 2,
    map: [
      "########",
      "#P.G..G#",
      "#.##.#.#",
      "#......#",
      "#.##.#.#",
      "#..G..E#",
      "########",
    ],
    hint: "Zbierz wymagane klejnoty 💎 i znajdź wyjście!",
    monsters: [],
  },
  {
    id: 2, name: "Pokój z Pułapkami", icon: "⚡", coins: 15,
    lives: 3, gemsNeeded: 3,
    map: [
      "##########",
      "#P...T..G#",
      "#.##.##..#",
      "#G.T...#.#",
      "#.##.##..#",
      "#...T..G.#",
      "#.##.##..#",
      "#........E",
      "##########",
    ],
    hint: "Unikaj pułapek ⚡! Krok na pułapkę = stracone życie.",
    monsters: [],
  },
  {
    id: 3, name: "Klucz i Drzwi", icon: "🔑", coins: 15,
    lives: 3, gemsNeeded: 2,
    map: [
      "##########",
      "#P..G.#..#",
      "#.##..#..#",
      "#..K..L.E#",
      "#.##..#..#",
      "#..G..#..#",
      "##########",
    ],
    hint: "Znajdź klucz 🔑, otwórz zamknięte drzwi 🚪!",
    monsters: [],
  },
  {
    id: 4, name: "Potwory!", icon: "👾", coins: 20,
    lives: 3, gemsNeeded: 3,
    map: [
      "##########",
      "#P.....G.#",
      "#.##.###.#",
      "#.G......#",
      "#.###.##.#",
      "#......G.#",
      "#.##.###.#",
      "#........E",
      "##########",
    ],
    hint: "Potwory 👾 chodzą po mapie. Nie wchodź na nie!",
    monsters: [
      { r: 3, c: 4, dir: "h" },
      { r: 5, c: 2, dir: "v" },
    ],
  },
  {
    id: 5, name: "Labirynt Diamentów", icon: "💎", coins: 20,
    lives: 3, gemsNeeded: 4,
    map: [
      "############",
      "#P..T.#..D.#",
      "#.##..#.##.#",
      "#..G..L..G.#",
      "#.##..#.##.#",
      "#.....#..K.#",
      "#.##T##.##.#",
      "#..G.....D.#",
      "#.####.###.#",
      "#..........E",
      "############",
    ],
    hint: "Diamenty 💎 warte 2 punkty! Klucz otwiera drogę.",
    monsters: [
      { r: 3, c: 1, dir: "v" },
    ],
  },
  {
    id: 6, name: "Szybkość!", icon: "⚡", coins: 20,
    lives: 2, gemsNeeded: 3,
    map: [
      "############",
      "#P...T.T..G#",
      "#.####.###.#",
      "#.G..T.....#",
      "#.###.####.#",
      "#..........#",
      "#.##T###.#.#",
      "#.G.....H#E#",
      "############",
    ],
    hint: "Tylko 2 życia! Serce ❤️ daje dodatkowe.",
    monsters: [
      { r: 5, c: 3, dir: "h" },
      { r: 5, c: 7, dir: "h" },
    ],
  },
  {
    id: 7, name: "Wielki Zamek", icon: "🏰", coins: 25,
    lives: 3, gemsNeeded: 5,
    map: [
      "##############",
      "#P......T..G.#",
      "#.####.###.#.#",
      "#.G...K....#.#",
      "#.####.###.#.#",
      "#......L...#.#",
      "#.####.###.#.#",
      "#.G..T...G.#.#",
      "#.####.#####.#",
      "#............#",
      "#.######.###.#",
      "#.G..T.....G.E",
      "##############",
    ],
    hint: "Ogromna mapa! Planuj trasę, zbieraj klejnoty.",
    monsters: [
      { r: 5, c: 2, dir: "h" },
      { r: 9, c: 5, dir: "h" },
      { r: 9, c: 9, dir: "h" },
    ],
  },
  {
    id: 8, name: "Mroczne Lochy", icon: "🌑", coins: 25,
    lives: 2, gemsNeeded: 4,
    map: [
      "############",
      "#P.T.T.#.G.#",
      "#.##.#.#.#.#",
      "#.K....L.#.#",
      "#.##.#.#.#.#",
      "#....T...#.#",
      "#.####.###.#",
      "#.G......G.#",
      "#.########.#",
      "#.G..H.....E",
      "############",
    ],
    hint: "Mroczne lochy... Mało żyć, dużo pułapek!",
    monsters: [
      { r: 5, c: 2, dir: "h" },
      { r: 7, c: 5, dir: "h" },
    ],
  },
  {
    id: 9, name: "Sala Potworów", icon: "👹", coins: 30,
    lives: 3, gemsNeeded: 5,
    map: [
      "##############",
      "#P.......G...#",
      "#.####.####..#",
      "#.G..........#",
      "#.###.#.####.#",
      "#.....#......#",
      "#.###.#.####.#",
      "#...G........#",
      "#.########.#.#",
      "#.G........G.E",
      "##############",
    ],
    hint: "Pełno potworów! Obserwuj ich ruchy i przemykaj.",
    monsters: [
      { r: 3, c: 4, dir: "h" },
      { r: 5, c: 2, dir: "h" },
      { r: 5, c: 8, dir: "h" },
      { r: 7, c: 5, dir: "h" },
      { r: 9, c: 4, dir: "h" },
    ],
  },
  {
    id: 10, name: "Wielki Finał!", icon: "🏆", coins: 40,
    lives: 3, gemsNeeded: 6,
    map: [
      "################",
      "#P...T....#..G.#",
      "#.####.##.#.##.#",
      "#.G..K....L..G.#",
      "#.####.##.#.##.#",
      "#....T....#....#",
      "#.####.######..#",
      "#..............#",
      "#.###.#####.##.#",
      "#.G..T.......G.#",
      "#.###.#######..#",
      "#.........H....#",
      "#.#.#########.##",
      "#.G............E",
      "################",
    ],
    hint: "Ostatni poziom! Wszystko czego się nauczyłeś!",
    monsters: [
      { r: 5, c: 3, dir: "h" },
      { r: 7, c: 5, dir: "h" },
      { r: 7, c: 10, dir: "h" },
      { r: 9, c: 7, dir: "h" },
      { r: 11, c: 3, dir: "h" },
      { r: 13, c: 6, dir: "h" },
    ],
  },
];

/* ============ TILE CONFIG ============ */
const TILE_DISPLAY = {
  "#": { emoji: "", cls: "wall" },
  ".": { emoji: "", cls: "floor" },
  P:  { emoji: "", cls: "floor" },
  G:  { emoji: "💎", cls: "gem" },
  D:  { emoji: "💠", cls: "diamond" },
  K:  { emoji: "🔑", cls: "key" },
  L:  { emoji: "🚪", cls: "locked" },
  E:  { emoji: "🚩", cls: "exit" },
  T:  { emoji: "⚡", cls: "trap" },
  H:  { emoji: "❤️", cls: "heart" },
};

const PLAYER_EMOJI = "🧑‍💻";
const MONSTER_EMOJI = "👾";

/* ============ GAME STATE ============ */
let advLevel = null;
let advGrid = [];
let advPlayerR = 0;
let advPlayerC = 0;
let advLives = 3;
let advGems = 0;
let advKeys = 0;
let advGemsNeeded = 0;
let advGameOver = false;
let advWon = false;
let advMonsters = [];
let advMonsterTimer = null;
let advMoveCount = 0;
let advInputLocked = false;

/* ============ WORLD SELECTION (TAB VIEW) ============ */
function renderAdventureMap() {
  if (!dom.adventureGrid) return;
  dom.adventureGrid.innerHTML = "";
  const completed = adventureProgress();

  const gradients = [
    "linear-gradient(135deg, #00B894, #55EFC4)",
    "linear-gradient(135deg, #6C5CE7, #A29BFE)",
    "linear-gradient(135deg, #E17055, #FAB1A0)",
    "linear-gradient(135deg, #0984E3, #74B9FF)",
    "linear-gradient(135deg, #FD79A8, #FDCB6E)",
    "linear-gradient(135deg, #00CEC9, #81ECEC)",
    "linear-gradient(135deg, #D63031, #FF7675)",
    "linear-gradient(135deg, #636E72, #B2BEC3)",
  ];

  ADV_LEVELS.forEach((level, i) => {
    const done = completed.includes(level.id);
    const unlocked = i === 0 || completed.includes(ADV_LEVELS[i - 1].id);
    const stars = (state.progress.adventure_stars || {})[String(level.id)] || 0;
    const grad = gradients[i % gradients.length];

    const card = document.createElement("div");
    card.className = "adv-level-card" + (done ? " completed" : "") + (!unlocked ? " locked" : "");

    card.innerHTML = `
      <div class="alc-icon-area" style="background:${grad}">
        <span class="alc-icon">${level.icon}</span>
        <span class="alc-number">${level.id}</span>
      </div>
      <div class="alc-body">
        <div class="alc-title">${esc(level.name)}</div>
        <div class="alc-desc">${done ? "✅ Ukończony" : unlocked ? "💎 " + level.gemsNeeded + " klejnotów" : "🔒 Zablokowany"}</div>
        <div class="alc-stars">${done ? starStr(stars, 3) : "☆☆☆"}</div>
      </div>
    `;

    if (unlocked) {
      card.addEventListener("click", () => startAdventureLevel(level.id));
    }
    dom.adventureGrid.appendChild(card);
  });

  if (dom.adventureCoinsTotal) dom.adventureCoinsTotal.textContent = "0";
}

/* ============ HELPERS ============ */
function adventureProgress() {
  if (!state.progress.adventure_completed) state.progress.adventure_completed = [];
  return state.progress.adventure_completed;
}
function adventureCoinsTotal() {
  const completed = adventureProgress();
  let coins = 0;
  ADV_LEVELS.forEach(lv => {
    if (completed.includes(lv.id)) coins += lv.coins;
  });
  return coins;
}

/* ============ START A LEVEL ============ */
function startAdventureLevel(levelId) {
  const level = ADV_LEVELS.find(l => l.id === levelId);
  if (!level) return;
  advLevel = level;

  // Parse map into grid
  advGrid = level.map.map(row => row.split(""));
  advGems = 0;
  advKeys = 0;
  advLives = level.lives;
  advGemsNeeded = level.gemsNeeded;
  advGameOver = false;
  advWon = false;
  advMoveCount = 0;
  advInputLocked = false;

  // Find player start
  for (let r = 0; r < advGrid.length; r++) {
    for (let c = 0; c < advGrid[r].length; c++) {
      if (advGrid[r][c] === "P") {
        advPlayerR = r;
        advPlayerC = c;
        advGrid[r][c] = ".";
      }
    }
  }

  // Init monsters
  advMonsters = (level.monsters || []).map(m => {
    const dr = m.dir === "v" ? 1 : 0;
    const dc = m.dir === "h" ? 1 : 0;
    return { r: m.r, c: m.c, dr, dc };
  });

  // Show adventure screen
  showScreen("adventure");

  // Update header
  if (dom.adventureTitle) dom.adventureTitle.textContent = level.icon + " " + level.name;

  // Show game area
  if (dom.adventureGameArea) dom.adventureGameArea.style.display = "flex";

  renderAdvGame();
  startMonsterLoop();
}

/* ============ RENDER THE GAME ============ */
function renderAdvGame() {
  const area = dom.adventureGameArea;
  if (!area) return;
  area.innerHTML = "";

  // Stats bar
  const stats = document.createElement("div");
  stats.className = "adv-stats-bar";
  stats.id = "adv-stats-bar";
  stats.innerHTML = `
    <span class="adv-stat">❤️ <span id="adv-lives">${advLives}</span></span>
    <span class="adv-stat">💎 <span id="adv-gems">${advGems}</span> / ${advGemsNeeded}</span>
    <span class="adv-stat">🔑 <span id="adv-keys">${advKeys}</span></span>
    <span class="adv-stat adv-hint-stat">💡 ${esc(advLevel.hint)}</span>
  `;
  area.appendChild(stats);

  // Grid container – size to fit viewport so d-pad stays visible
  const gridEl = document.createElement("div");
  gridEl.className = "adv-grid";
  gridEl.id = "adv-grid";
  const cols = advGrid[0].length;
  const rows = advGrid.length;
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Constrain grid so everything fits on-screen without scrolling
  // Controls are now to the right of the grid, so subtract dpad width horizontally
  const topBarH = 60, statsH = 80, dpadW = 190, padV = 48, padH = 56, gap = 4;
  const availH = window.innerHeight - topBarH - statsH - padV;
  const cellByH = (availH - (rows - 1) * gap) / rows;
  const parentW = Math.min(720, window.innerWidth - padH) - dpadW - 16;
  const cellByW = (parentW - (cols - 1) * gap) / cols;
  const cell = Math.max(20, Math.min(cellByH, cellByW));
  const gridW = cell * cols + (cols - 1) * gap + 8; // +8 for border
  gridEl.style.maxWidth = gridW + "px";

  for (let r = 0; r < advGrid.length; r++) {
    for (let c = 0; c < advGrid[r].length; c++) {
      const tile = advGrid[r][c];
      const info = TILE_DISPLAY[tile] || TILE_DISPLAY["."];
      const cell = document.createElement("div");
      cell.className = "adv-cell adv-cell-" + info.cls;

      if (r === advPlayerR && c === advPlayerC) {
        cell.innerHTML = `<span class="adv-entity adv-player">${PLAYER_EMOJI}</span>`;
      } else if (advMonsters.some(m => m.r === r && m.c === c)) {
        cell.innerHTML = `<span class="adv-entity adv-monster">${MONSTER_EMOJI}</span>`;
      } else if (info.emoji) {
        cell.innerHTML = `<span class="adv-tile-emoji">${info.emoji}</span>`;
      }

      gridEl.appendChild(cell);
    }
  }
  const gridRow = document.createElement("div");
  gridRow.className = "adv-grid-row";
  gridRow.appendChild(gridEl);

  // D-pad controls
  const controls = document.createElement("div");
  controls.className = "adv-controls";
  controls.innerHTML = `
    <div class="adv-dpad">
      <button class="adv-dpad-btn adv-dpad-up" data-dir="up">▲</button>
      <div class="adv-dpad-mid">
        <button class="adv-dpad-btn adv-dpad-left" data-dir="left">◀</button>
        <div class="adv-dpad-center"></div>
        <button class="adv-dpad-btn adv-dpad-right" data-dir="right">▶</button>
      </div>
      <button class="adv-dpad-btn adv-dpad-down" data-dir="down">▼</button>
    </div>
  `;
  gridRow.appendChild(controls);
  area.appendChild(gridRow);

  // Overlay (win/lose)
  const overlay = document.createElement("div");
  overlay.className = "adv-overlay";
  overlay.id = "adv-overlay";
  overlay.style.display = "none";
  area.appendChild(overlay);

  // D-pad click handlers
  controls.querySelectorAll(".adv-dpad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (advGameOver || advInputLocked) return;
      movePlayer(btn.dataset.dir);
    });
  });
}

/* ============ UPDATE DISPLAY ============ */
function updateAdvDisplay() {
  const gridEl = document.getElementById("adv-grid");
  if (!gridEl) return;
  const cols = advGrid[0].length;

  for (let r = 0; r < advGrid.length; r++) {
    for (let c = 0; c < advGrid[r].length; c++) {
      const idx = r * cols + c;
      const cell = gridEl.children[idx];
      if (!cell) continue;
      const tile = advGrid[r][c];
      const info = TILE_DISPLAY[tile] || TILE_DISPLAY["."];

      cell.className = "adv-cell adv-cell-" + info.cls;

      if (r === advPlayerR && c === advPlayerC) {
        cell.innerHTML = `<span class="adv-entity adv-player">${PLAYER_EMOJI}</span>`;
      } else if (advMonsters.some(m => m.r === r && m.c === c)) {
        cell.innerHTML = `<span class="adv-entity adv-monster">${MONSTER_EMOJI}</span>`;
      } else if (info.emoji) {
        cell.innerHTML = `<span class="adv-tile-emoji">${info.emoji}</span>`;
      } else {
        cell.innerHTML = "";
      }
    }
  }

  const livesEl = document.getElementById("adv-lives");
  const gemsEl = document.getElementById("adv-gems");
  const keysEl = document.getElementById("adv-keys");
  if (livesEl) livesEl.textContent = advLives;
  if (gemsEl) gemsEl.textContent = advGems;
  if (keysEl) keysEl.textContent = advKeys;
}

/* ============ PLAYER MOVEMENT ============ */
function movePlayer(dir) {
  if (advGameOver || advInputLocked) return;
  const deltas = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  const [dr, dc] = deltas[dir] || [0, 0];
  const nr = advPlayerR + dr;
  const nc = advPlayerC + dc;

  if (nr < 0 || nr >= advGrid.length || nc < 0 || nc >= advGrid[0].length) return;

  const tile = advGrid[nr][nc];

  // Wall
  if (tile === "#") return;

  // Locked door
  if (tile === "L") {
    if (advKeys > 0) {
      advKeys--;
      advGrid[nr][nc] = ".";
      flashMessage("🔓 Drzwi otwarte!");
    } else {
      flashMessage("🔒 Potrzebujesz klucza!");
      return;
    }
  }

  // Move
  advPlayerR = nr;
  advPlayerC = nc;
  advMoveCount++;

  // Collect / interact
  if (tile === "G") {
    advGems++;
    advGrid[nr][nc] = ".";
    flashMessage("💎 +1 klejnot!");
  } else if (tile === "D") {
    advGems += 2;
    advGrid[nr][nc] = ".";
    flashMessage("💠 +2 diamenty!");
  } else if (tile === "K") {
    advKeys++;
    advGrid[nr][nc] = ".";
    flashMessage("🔑 Masz klucz!");
  } else if (tile === "H") {
    advLives++;
    advGrid[nr][nc] = ".";
    flashMessage("❤️ +1 życie!");
  } else if (tile === "T") {
    advLives--;
    advGrid[nr][nc] = ".";
    flashMessage("⚡ Pułapka! Tracisz życie!");
    if (advLives <= 0) {
      advGameOver = true;
      updateAdvDisplay();
      showAdvOverlay(false);
      return;
    }
  } else if (tile === "E") {
    if (advGems >= advGemsNeeded) {
      advWon = true;
      advGameOver = true;
      updateAdvDisplay();
      showAdvOverlay(true);
      return;
    } else {
      flashMessage(`🚩 Potrzebujesz jeszcze ${advGemsNeeded - advGems} 💎!`);
    }
  }

  // Monster collision
  if (advMonsters.some(m => m.r === advPlayerR && m.c === advPlayerC)) {
    advLives--;
    flashMessage("👾 Potwór! Tracisz życie!");
    if (advLives <= 0) {
      advGameOver = true;
      updateAdvDisplay();
      showAdvOverlay(false);
      return;
    }
    advPlayerR -= dr;
    advPlayerC -= dc;
  }

  updateAdvDisplay();
}

/* ============ MONSTER AI ============ */
function startMonsterLoop() {
  stopMonsterLoop();
  if (advMonsters.length === 0) return;
  advMonsterTimer = setInterval(() => {
    if (advGameOver) { stopMonsterLoop(); return; }
    moveMonsters();
  }, 700);
}

function stopMonsterLoop() {
  if (advMonsterTimer) { clearInterval(advMonsterTimer); advMonsterTimer = null; }
}

function moveMonsters() {
  advMonsters.forEach(m => {
    const nr = m.r + m.dr;
    const nc = m.c + m.dc;

    if (nr < 0 || nr >= advGrid.length || nc < 0 || nc >= advGrid[0].length ||
        advGrid[nr][nc] === "#" || advGrid[nr][nc] === "L") {
      m.dr = -m.dr;
      m.dc = -m.dc;
    } else {
      m.r = nr;
      m.c = nc;
    }

    if (m.r === advPlayerR && m.c === advPlayerC) {
      advLives--;
      flashMessage("👾 Potwór Cię złapał!");
      if (advLives <= 0) {
        advGameOver = true;
        updateAdvDisplay();
        showAdvOverlay(false);
        return;
      }
    }
  });
  updateAdvDisplay();
}

/* ============ WIN / LOSE OVERLAY ============ */
function showAdvOverlay(won) {
  stopMonsterLoop();
  const overlay = document.getElementById("adv-overlay");
  if (!overlay) return;

  if (won) {
    const stars = advLives >= advLevel.lives ? 3 : advLives >= 2 ? 2 : 1;
    const completed = adventureProgress();
    if (!completed.includes(advLevel.id)) completed.push(advLevel.id);
    saveAdventureProgress(advLevel.id, stars);

    overlay.innerHTML = `
      <div class="adv-overlay-card adv-win">
        <div class="adv-overlay-emoji">🎉</div>
        <h2>Zwycięstwo!</h2>
        <p>${starStr(stars, 3)}</p>
        <p class="adv-overlay-detail">💎 ${advGems} zebranych &nbsp; Ruchy: ${advMoveCount}</p>
        <div class="adv-overlay-btns">
          <button class="btn btn-primary adv-overlay-btn" id="adv-btn-next">Dalej ➡</button>
          <button class="btn btn-secondary adv-overlay-btn" id="adv-btn-list">📋 Lista</button>
        </div>
      </div>
    `;
    overlay.querySelector("#adv-btn-next").addEventListener("click", () => {
      const nextId = advLevel.id + 1;
      const next = ADV_LEVELS.find(l => l.id === nextId);
      if (next) startAdventureLevel(nextId);
      else exitAdventureToList();
    });
  } else {
    overlay.innerHTML = `
      <div class="adv-overlay-card adv-lose">
        <div class="adv-overlay-emoji">💀</div>
        <h2>Game Over!</h2>
        <p>Nie poddawaj się — spróbuj ponownie!</p>
        <div class="adv-overlay-btns">
          <button class="btn btn-primary adv-overlay-btn" id="adv-btn-retry">🔄 Jeszcze raz</button>
          <button class="btn btn-secondary adv-overlay-btn" id="adv-btn-list">📋 Lista</button>
        </div>
      </div>
    `;
    overlay.querySelector("#adv-btn-retry").addEventListener("click", () => {
      startAdventureLevel(advLevel.id);
    });
  }

  overlay.querySelector("#adv-btn-list").addEventListener("click", exitAdventureToList);
  overlay.style.display = "flex";
}

/* ============ FLASH MESSAGE ============ */
function flashMessage(text) {
  const stats = document.getElementById("adv-stats-bar");
  if (!stats) return;
  let flash = document.getElementById("adv-flash");
  if (!flash) {
    flash = document.createElement("div");
    flash.id = "adv-flash";
    flash.className = "adv-flash";
    stats.parentElement.insertBefore(flash, stats.nextSibling);
  }
  flash.textContent = text;
  flash.classList.remove("adv-flash-anim");
  void flash.offsetWidth;
  flash.classList.add("adv-flash-anim");
}

/* ============ SAVE PROGRESS ============ */
async function saveAdventureProgress(stopId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adventure_id: stopId, adventure_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Adventure save failed", e); }
}

/* ============ NAVIGATION ============ */
function exitAdventureToList() {
  stopMonsterLoop();
  advGameOver = true;
  advLevel = null;
  if (dom.adventureGameArea) { dom.adventureGameArea.style.display = "none"; dom.adventureGameArea.innerHTML = ""; }
  showScreen("levels");
  renderAdventureMap();
}

function onAdventureBack() {
  if (advLevel) {
    exitAdventureToList();
  } else {
    showScreen("levels");
  }
}

function stopAdventure() {
  stopMonsterLoop();
  advGameOver = true;
  advLevel = null;
}

/* ============ KEYBOARD CONTROLS ============ */
document.addEventListener("keydown", (e) => {
  if (!advLevel || advGameOver || advInputLocked) return;
  const advScreen = document.getElementById("screen-adventure");
  if (!advScreen || !advScreen.classList.contains("active")) return;

  const keyMap = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
  };
  const dir = keyMap[e.key];
  if (dir) {
    e.preventDefault();
    movePlayer(dir);
  }
});

/* ============ TOUCH/SWIPE CONTROLS ============ */
let advTouchStart = null;
document.addEventListener("touchstart", (e) => {
  if (!advLevel || advGameOver) return;
  const advScreen = document.getElementById("screen-adventure");
  if (!advScreen || !advScreen.classList.contains("active")) return;
  if (e.touches.length === 1) {
    advTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (!advTouchStart || !advLevel || advGameOver) return;
  const dx = e.changedTouches[0].clientX - advTouchStart.x;
  const dy = e.changedTouches[0].clientY - advTouchStart.y;
  advTouchStart = null;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 20) return;
  if (absDx > absDy) {
    movePlayer(dx > 0 ? "right" : "left");
  } else {
    movePlayer(dy > 0 ? "down" : "up");
  }
}, { passive: true });

/* Legacy stubs */
function checkAdventureReturn() { return false; }
function onAdventureTaskComplete() {}
function renderAdventurePath() {}
function enterAdventureWorld() {}
