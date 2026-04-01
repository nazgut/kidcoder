/* ==========================================================
   KidCoder – Crossword puzzle module ("hasło" format)
   ========================================================== */

function renderCrosswordList() {
  const grid = dom.crosswordGrid;
  if (!grid) return;
  grid.innerHTML = "";
  const puzzles = state.crosswordPuzzles || [];
  const completed = state.progress.crossword_completed || [];
  const starsMap = state.progress.crossword_stars || {};

  puzzles.forEach(p => {
    const done = completed.includes(p.id);
    const s = starsMap[String(p.id)] || 0;
    const card = document.createElement("div");
    card.className = "level-card" + (done ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${p.id}</div>
      <div class="level-title">${esc(p.title)}</div>
      <div class="level-desc-mini">${esc(p.description)}</div>
      <div class="level-stars">${done ? starStr(s, 3) : "☆☆☆"}</div>`;
    card.addEventListener("click", () => loadCrossword(p.id));
    grid.appendChild(card);
  });
}

async function loadCrossword(id) {
  try {
    const res = await fetch(`${API}/api/crossword/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    state.currentCrossword = data;
    state.crosswordAttempts = 0;
    state.crosswordSolved = false;
    dom.crosswordTitle.textContent = `✏️ ${data.title}`;
    if (dom.crosswordDesc) dom.crosswordDesc.textContent = data.description;
    dom.crosswordFeedback.textContent = "";
    dom.crosswordFeedback.className = "crossword-feedback";
    buildCrosswordBoard(data);
    showScreen("crossword");
  } catch (e) { console.error("Load crossword failed", e); }
}

function buildCrosswordBoard(data) {
  const rows = data.rows;
  const secret = data.secret;

  // Compute secret column = max highlight index (so no negative offsets)
  const secretCol = Math.max(...rows.map(r => r.highlight));

  // Compute grid width
  const gridCols = Math.max(...rows.map(r => (secretCol - r.highlight) + r.word.length));

  // Build solution per row
  state.crosswordSolution = rows.map(r => r.word.toUpperCase());
  state.crosswordOffsets = rows.map(r => secretCol - r.highlight);
  state.crosswordSecretCol = secretCol;
  state.crosswordInputs = [];

  // Build clues
  const cluesEl = dom.crosswordClues;
  cluesEl.innerHTML = "";
  rows.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "crossword-clue";
    div.innerHTML = `<strong>${i + 1}.</strong> ${esc(r.clue)} <small>(${r.word.length} liter)</small>`;
    cluesEl.appendChild(div);
  });

  // Build board
  const board = dom.crosswordBoard;
  board.innerHTML = "";

  rows.forEach((r, rowIdx) => {
    const rowEl = document.createElement("div");
    rowEl.className = "cw-row";

    // Row number
    const numEl = document.createElement("span");
    numEl.className = "cw-row-num";
    numEl.textContent = rowIdx + 1 + ".";
    rowEl.appendChild(numEl);

    const offset = secretCol - r.highlight;

    // Spacer cells
    for (let s = 0; s < offset; s++) {
      const spacer = document.createElement("div");
      spacer.className = "cw-spacer";
      rowEl.appendChild(spacer);
    }

    // Word cells
    for (let ci = 0; ci < r.word.length; ci++) {
      const colPos = offset + ci;
      const isSecret = colPos === secretCol;

      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 1;
      inp.className = "cw-cell" + (isSecret ? " cw-secret" : "");
      inp.dataset.row = rowIdx;
      inp.dataset.ci = ci;
      inp.autocomplete = "off";
      inp.autocorrect = "off";
      inp.autocapitalize = "off";
      inp.spellcheck = false;
      inp.addEventListener("input", onCrosswordInput);
      inp.addEventListener("keydown", onCrosswordKeyDown);
      state.crosswordInputs.push(inp);
      rowEl.appendChild(inp);
    }

    board.appendChild(rowEl);
  });

  // Secret word display
  const secretEl = document.createElement("div");
  secretEl.className = "cw-secret-display";
  secretEl.innerHTML = `<span class="cw-secret-label">Hasło:</span> <span id="cw-secret-letters" class="cw-secret-letters">${"_ ".repeat(secret.length).trim()}</span>`;
  board.appendChild(secretEl);
}

function updateSecretDisplay() {
  const el = document.getElementById("cw-secret-letters");
  if (!el || !state.currentCrossword) return;
  const rows = state.currentCrossword.rows;
  const letters = rows.map((r, i) => {
    // Find the input for the highlight index in this row
    const inputs = state.crosswordInputs.filter(inp => +inp.dataset.row === i);
    const inp = inputs[r.highlight];
    return inp && inp.value ? inp.value.toUpperCase() : "_";
  });
  el.textContent = letters.join(" ");
}

function onCrosswordInput(e) {
  const inp = e.target;
  const v = inp.value.toUpperCase().replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g, "");
  inp.value = v.charAt(0);
  if (inp.value) {
    // Move to next input in same row, or first input in next row
    const rowIdx = +inp.dataset.row;
    const ci = +inp.dataset.ci;
    const rowInputs = state.crosswordInputs.filter(x => +x.dataset.row === rowIdx);
    const nextInRow = rowInputs.find(x => +x.dataset.ci === ci + 1);
    if (nextInRow) {
      nextInRow.focus();
    } else {
      // First input of next row
      const nextRow = state.crosswordInputs.find(x => +x.dataset.row === rowIdx + 1 && +x.dataset.ci === 0);
      if (nextRow) nextRow.focus();
    }
  }
  updateSecretDisplay();
}

function onCrosswordKeyDown(e) {
  const inp = e.target;
  const rowIdx = +inp.dataset.row;
  const ci = +inp.dataset.ci;

  if (e.key === "Backspace" && !inp.value) {
    e.preventDefault();
    const rowInputs = state.crosswordInputs.filter(x => +x.dataset.row === rowIdx);
    const prevInRow = rowInputs.find(x => +x.dataset.ci === ci - 1);
    if (prevInRow) {
      prevInRow.focus();
    }
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    const rowInputs = state.crosswordInputs.filter(x => +x.dataset.row === rowIdx);
    const next = rowInputs.find(x => +x.dataset.ci === ci + 1);
    if (next) next.focus();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const rowInputs = state.crosswordInputs.filter(x => +x.dataset.row === rowIdx);
    const prev = rowInputs.find(x => +x.dataset.ci === ci - 1);
    if (prev) prev.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const nextRowFirst = state.crosswordInputs.find(x => +x.dataset.row === rowIdx + 1 && +x.dataset.ci === 0);
    if (nextRowFirst) nextRowFirst.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prevRowFirst = state.crosswordInputs.find(x => +x.dataset.row === rowIdx - 1 && +x.dataset.ci === 0);
    if (prevRowFirst) prevRowFirst.focus();
  }
}

function checkCrossword() {
  if (!state.currentCrossword || state.crosswordSolved) return;
  state.crosswordAttempts++;

  let correct = 0;
  let total = 0;

  state.currentCrossword.rows.forEach((r, rowIdx) => {
    const expected = r.word.toUpperCase();
    const rowInputs = state.crosswordInputs.filter(x => +x.dataset.row === rowIdx);
    for (let ci = 0; ci < expected.length; ci++) {
      const inp = rowInputs.find(x => +x.dataset.ci === ci);
      if (!inp) continue;
      total++;
      inp.classList.remove("correct", "wrong");
      if (inp.value.toUpperCase() === expected[ci]) {
        inp.classList.add("correct");
        correct++;
      } else {
        inp.classList.add("wrong");
      }
    }
  });

  if (correct === total) {
    state.crosswordSolved = true;
    const stars = state.crosswordAttempts === 1 ? 3 : state.crosswordAttempts <= 3 ? 2 : 1;
    dom.crosswordFeedback.textContent = `🎉 Hasło to: ${state.currentCrossword.secret}!`;
    dom.crosswordFeedback.className = "crossword-feedback success";

    dom.crosswordModalStars.textContent = starStr(stars, 3);
    dom.crosswordModalMessage.textContent =
      stars === 3 ? "Perfekcyjnie za pierwszym razem! 🌟" :
      stars === 2 ? "Świetna robota! 💪" : "Udało się! Spróbuj szybciej następnym razem 😊";
    showModal("crossword-success");
    saveCrosswordProgress(state.currentCrossword.id, stars);
  } else {
    dom.crosswordFeedback.textContent = `Poprawne: ${correct}/${total} – popraw czerwone pola!`;
    dom.crosswordFeedback.className = "crossword-feedback error";
  }
}

async function saveCrosswordProgress(id, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crossword_id: id, crossword_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Save crossword failed", e); }
}

function onNextCrossword() {
  hideModal("crossword-success");
  const puzzles = state.crosswordPuzzles || [];
  const idx = puzzles.findIndex(p => p.id === state.currentCrossword.id);
  if (idx >= 0 && idx < puzzles.length - 1) {
    loadCrossword(puzzles[idx + 1].id);
  } else {
    showScreen("levels");
    renderCrosswordList();
  }
}
