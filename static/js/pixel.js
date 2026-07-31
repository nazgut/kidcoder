/* ==========================================================
   KidCoder – Pixel Art Module (koduj obrazki)
   Dziecko odczytuje kod wiersza (RLE) i maluje piksele.
   ========================================================== */

// ============ PIXEL PUZZLE LIST ============
function renderPixelList() {
  if (!dom.pixelGrid) return;
  dom.pixelGrid.innerHTML = "";
  (state.pixelPuzzles || []).forEach(puzzle => {
    const completed = (state.progress.pixel_completed || []).includes(puzzle.id);
    const stars = (state.progress.pixel_stars || {})[String(puzzle.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${puzzle.id}</div>
      <h3>${esc(puzzle.title)}</h3>
      <p>${esc(puzzle.description)}</p>
      <p class="level-desc-mini">Siatka ${puzzle.size}×${puzzle.size}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadPixelPuzzle(puzzle.id));
    dom.pixelGrid.appendChild(card);
  });
}

// ============ LOAD PUZZLE ============
async function loadPixelPuzzle(puzzleId) {
  try {
    const res = await fetch(`${API}/api/pixel/${puzzleId}`);
    state.currentPixel = await res.json();
  } catch { return; }

  const p = state.currentPixel;
  state.pixelSolved = false;
  state.pixelMistakes = 0;
  state.pixelHintIndex = 0;
  state.pixelSelectedColor = Object.keys(p.palette)[0];
  state.pixelPlayerGrid = p.grid.map(row => row.split("").map(() => "."));

  dom.pixelTitle.textContent = `${p.title}`;
  dom.pixelFeedback.textContent = "";
  dom.pixelFeedback.className = "logic-feedback";

  renderPixelPalette();
  renderPixelBoard();
  showScreen("pixel");
}

// ============ PALETTE ============
function renderPixelPalette() {
  const p = state.currentPixel;
  dom.pixelPalette.innerHTML = "";

  Object.entries(p.palette).forEach(([letter, info]) => {
    const btn = document.createElement("button");
    btn.className = "pixel-color-btn" + (state.pixelSelectedColor === letter ? " selected" : "");
    btn.style.background = info.color;
    btn.title = info.name;
    btn.innerHTML = `<span class="pixel-color-name">${esc(info.name)}</span>`;
    btn.addEventListener("click", () => {
      state.pixelSelectedColor = letter;
      renderPixelPalette();
    });
    dom.pixelPalette.appendChild(btn);
  });

  const eraser = document.createElement("button");
  eraser.className = "pixel-color-btn pixel-eraser" + (state.pixelSelectedColor === "." ? " selected" : "");
  eraser.title = "gumka";
  eraser.innerHTML = `🧽<span class="pixel-color-name">gumka</span>`;
  eraser.addEventListener("click", () => {
    state.pixelSelectedColor = ".";
    renderPixelPalette();
  });
  dom.pixelPalette.appendChild(eraser);
}

// ============ BOARD ============
function pixelRowCode(rowStr) {
  // Run-length encode a target row: "..RR." -> [ [".",2], ["R",2], [".",1] ]
  const runs = [];
  for (const ch of rowStr) {
    if (runs.length && runs[runs.length - 1][0] === ch) runs[runs.length - 1][1]++;
    else runs.push([ch, 1]);
  }
  return runs;
}

function renderPixelBoard() {
  const p = state.currentPixel;
  dom.pixelBoard.innerHTML = "";
  dom.pixelBoard.style.setProperty("--pixel-cols", p.size);

  p.grid.forEach((rowStr, y) => {
    const rowEl = document.createElement("div");
    rowEl.className = "pixel-row";

    const codeEl = document.createElement("div");
    codeEl.className = "pixel-row-code";
    pixelRowCode(rowStr).forEach(([ch, count]) => {
      const chip = document.createElement("span");
      chip.className = "pixel-code-chip";
      const swatch = ch === "."
        ? `<span class="pixel-swatch pixel-swatch-empty"></span>`
        : `<span class="pixel-swatch" style="background:${p.palette[ch].color}"></span>`;
      chip.innerHTML = `${count}${swatch}`;
      codeEl.appendChild(chip);
    });
    rowEl.appendChild(codeEl);

    const cellsEl = document.createElement("div");
    cellsEl.className = "pixel-cells";
    rowStr.split("").forEach((_, x) => {
      const cell = document.createElement("button");
      cell.className = "pixel-cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", () => paintPixel(x, y));
      cellsEl.appendChild(cell);
    });
    rowEl.appendChild(cellsEl);
    dom.pixelBoard.appendChild(rowEl);
  });

  refreshPixelBoard();
}

function refreshPixelBoard() {
  const p = state.currentPixel;
  dom.pixelBoard.querySelectorAll(".pixel-cell").forEach(cell => {
    const x = +cell.dataset.x, y = +cell.dataset.y;
    const ch = state.pixelPlayerGrid[y][x];
    if (ch === ".") {
      cell.style.background = "";
      cell.classList.remove("filled");
    } else {
      cell.style.background = p.palette[ch].color;
      cell.classList.add("filled");
    }
  });
  dom.pixelBoard.querySelectorAll(".pixel-row").forEach((rowEl, y) => {
    const done = state.pixelPlayerGrid[y].join("") === p.grid[y];
    rowEl.classList.toggle("row-ok", done);
  });
}

// ============ PAINTING ============
function paintPixel(x, y) {
  if (state.pixelSolved) return;
  const p = state.currentPixel;
  const prev = state.pixelPlayerGrid[y][x];
  const next = state.pixelSelectedColor;
  if (prev === next) return;

  state.pixelPlayerGrid[y][x] = next;
  if (next !== "." && next !== p.grid[y][x]) state.pixelMistakes++;

  refreshPixelBoard();

  const rowDone = state.pixelPlayerGrid[y].join("") === p.grid[y];
  if (rowDone && typeof Fun !== "undefined") Fun.sound("pop");

  const allDone = state.pixelPlayerGrid.every((row, i) => row.join("") === p.grid[i]);
  if (allDone) onPixelComplete();
}

// ============ COMPLETE ============
function onPixelComplete() {
  state.pixelSolved = true;
  let stars = 3;
  if (state.pixelMistakes > 3) stars = 2;
  if (state.pixelMistakes > 10) stars = 1;

  savePixelProgress(state.currentPixel.id, stars);

  dom.pixelModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Obrazek gotowy! Następnym razem uważniej z kodem 🎨",
    "Piękny piksel-obrazek! Prawie bez pomyłek! 🖼️",
    "PERFEKCYJNIE! Malujesz kodem jak prawdziwy artysta! 🎨",
  ];
  dom.pixelModalMessage.textContent = messages[stars - 1] || messages[2];
  setTimeout(() => showModal("pixel-success"), 600);
}

function onNextPixel() {
  hideModal("pixel-success");
  const nextId = state.currentPixel.id + 1;
  const exists = (state.pixelPuzzles || []).find(p => p.id === nextId);
  if (exists) {
    loadPixelPuzzle(nextId);
  } else {
    showScreen("levels");
    renderPixelList();
  }
}

function onPixelHint() {
  const hints = (state.currentPixel && state.currentPixel.hints) || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Czytaj kod wiersza od lewej do prawej. Dasz radę!";
  } else {
    dom.hintText.textContent = hints[state.pixelHintIndex % hints.length];
    state.pixelHintIndex++;
  }
  showModal("hint");
}

async function savePixelProgress(puzzleId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixel_id: puzzleId, pixel_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
