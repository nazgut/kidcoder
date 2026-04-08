/* ==========================================================
   KidCoder – Sudoku puzzle module for kids
   ========================================================== */

function renderSudokuList() {
  const grid = dom.sudokuGrid;
  if (!grid) return;
  grid.innerHTML = "";
  const puzzles = state.sudokuPuzzles || [];
  const completed = state.progress.sudoku_completed || [];
  const starsMap = state.progress.sudoku_stars || {};

  puzzles.forEach(p => {
    const done = completed.includes(p.id);
    const s = starsMap[String(p.id)] || 0;
    const diffBadge = p.difficulty === "łatwe" ? "🟢" : p.difficulty === "średnie" ? "🟡" : "🔴";
    const card = document.createElement("div");
    card.className = "level-card" + (done ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${p.id}</div>
      <div class="level-title">${esc(p.title)}</div>
      <div class="level-desc-mini">${esc(p.description)}</div>
      <div class="level-desc-mini">${diffBadge} ${esc(p.difficulty)} · ${p.size}×${p.size}</div>
      <div class="level-stars">${done ? starStr(s, 3) : "☆☆☆"}</div>`;
    card.addEventListener("click", () => loadSudoku(p.id));
    grid.appendChild(card);
  });
}

async function loadSudoku(id) {
  try {
    const res = await fetch(`${API}/api/sudoku/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    state.currentSudoku = data;
    state.sudokuAttempts = 0;
    state.sudokuSolved = false;
    state.sudokuHintIndex = 0;
    dom.sudokuTitle.textContent = `🔢 ${data.title}`;
    dom.sudokuFeedback.textContent = "";
    dom.sudokuFeedback.className = "sudoku-feedback";
    buildSudokuBoard(data);
    showScreen("sudoku");
  } catch (e) { console.error("Load sudoku failed", e); }
}

function buildSudokuBoard(data) {
  const board = dom.sudokuBoard;
  board.innerHTML = "";
  board.className = "sudoku-board sudoku-size-" + data.size;

  const size = data.size;
  const grid = data.grid;
  state.sudokuInputs = [];

  // Set CSS grid
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  // Box dimensions
  const boxRows = size === 4 ? 2 : 2;
  const boxCols = size === 4 ? 2 : 3;

  for (let r = 0; r < size; r++) {
    const rowInputs = [];
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";

      // Add box borders
      if (r % boxRows === 0 && r > 0) cell.classList.add("sudoku-border-top");
      if (c % boxCols === 0 && c > 0) cell.classList.add("sudoku-border-left");

      if (val !== 0) {
        // Given cell
        cell.classList.add("sudoku-given");
        cell.textContent = val;
        rowInputs.push(null);
      } else {
        // Input cell
        const inp = document.createElement("input");
        inp.type = "text";
        inp.maxLength = 1;
        inp.className = "sudoku-input";
        inp.inputMode = "numeric";
        inp.pattern = "[1-" + size + "]";
        inp.dataset.row = r;
        inp.dataset.col = c;

        inp.addEventListener("input", function () {
          const v = this.value;
          if (v && (!/^[1-9]$/.test(v) || parseInt(v) > size)) {
            this.value = "";
            return;
          }
          this.classList.remove("sudoku-error", "sudoku-correct");
          highlightSudokuConflicts();
        });

        inp.addEventListener("keydown", function (e) {
          const row = parseInt(this.dataset.row);
          const col = parseInt(this.dataset.col);
          let nr = row, nc = col;
          if (e.key === "ArrowUp") nr = Math.max(0, row - 1);
          else if (e.key === "ArrowDown") nr = Math.min(size - 1, row + 1);
          else if (e.key === "ArrowLeft") nc = Math.max(0, col - 1);
          else if (e.key === "ArrowRight") nc = Math.min(size - 1, col + 1);
          else return;

          e.preventDefault();
          const target = state.sudokuInputs[nr]?.[nc];
          if (target) target.focus();
          else {
            // find nearest input in that direction
            const allInputs = dom.sudokuBoard.querySelectorAll(".sudoku-input");
            allInputs.forEach(inp => {
              if (parseInt(inp.dataset.row) === nr && parseInt(inp.dataset.col) === nc) inp.focus();
            });
          }
        });

        cell.appendChild(inp);
        rowInputs.push(inp);
      }
      board.appendChild(cell);
    }
    state.sudokuInputs.push(rowInputs);
  }
}

function highlightSudokuConflicts() {
  if (!state.currentSudoku) return;
  const size = state.currentSudoku.size;
  const grid = getCurrentSudokuGrid();

  // Clear all error highlights
  dom.sudokuBoard.querySelectorAll(".sudoku-input").forEach(inp => {
    inp.classList.remove("sudoku-error");
  });

  const boxRows = size === 4 ? 2 : 2;
  const boxCols = size === 4 ? 2 : 3;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      const inp = state.sudokuInputs[r]?.[c];
      if (!inp) continue; // given cell

      // Check row
      for (let cc = 0; cc < size; cc++) {
        if (cc !== c && grid[r][cc] === v) {
          inp.classList.add("sudoku-error");
        }
      }
      // Check col
      for (let rr = 0; rr < size; rr++) {
        if (rr !== r && grid[rr][c] === v) {
          inp.classList.add("sudoku-error");
        }
      }
      // Check box
      const br = Math.floor(r / boxRows) * boxRows;
      const bc = Math.floor(c / boxCols) * boxCols;
      for (let rr = br; rr < br + boxRows; rr++) {
        for (let cc = bc; cc < bc + boxCols; cc++) {
          if (rr !== r || cc !== c) {
            if (grid[rr][cc] === v) {
              inp.classList.add("sudoku-error");
            }
          }
        }
      }
    }
  }
}

function getCurrentSudokuGrid() {
  const data = state.currentSudoku;
  const size = data.size;
  const result = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      if (data.grid[r][c] !== 0) {
        row.push(data.grid[r][c]);
      } else {
        const inp = state.sudokuInputs[r]?.[c];
        const v = inp ? parseInt(inp.value) || 0 : 0;
        row.push(v);
      }
    }
    result.push(row);
  }
  return result;
}

function checkSudoku() {
  if (!state.currentSudoku || state.sudokuSolved) return;
  state.sudokuAttempts++;

  const data = state.currentSudoku;
  const size = data.size;
  const current = getCurrentSudokuGrid();
  const solution = data.solution;

  // Check if all cells filled
  let allFilled = true;
  let allCorrect = true;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (current[r][c] === 0) {
        allFilled = false;
      }
      if (current[r][c] !== solution[r][c]) {
        allCorrect = false;
      }
    }
  }

  if (!allFilled) {
    dom.sudokuFeedback.textContent = "✏️ Uzupełnij wszystkie puste pola!";
    dom.sudokuFeedback.className = "sudoku-feedback sudoku-feedback-warn";
    return;
  }

  if (!allCorrect) {
    dom.sudokuFeedback.textContent = "❌ Coś się nie zgadza. Sprawdź podświetlone pola!";
    dom.sudokuFeedback.className = "sudoku-feedback sudoku-feedback-error";
    // Highlight wrong cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const inp = state.sudokuInputs[r]?.[c];
        if (inp && current[r][c] !== solution[r][c]) {
          inp.classList.add("sudoku-error");
        } else if (inp && current[r][c] === solution[r][c]) {
          inp.classList.add("sudoku-correct");
        }
      }
    }
    return;
  }

  // All correct!
  state.sudokuSolved = true;
  dom.sudokuFeedback.textContent = "";
  dom.sudokuFeedback.className = "sudoku-feedback";

  // Mark all inputs as correct
  dom.sudokuBoard.querySelectorAll(".sudoku-input").forEach(inp => {
    inp.classList.add("sudoku-correct");
    inp.readOnly = true;
  });

  // Calculate stars
  let stars = 3;
  if (state.sudokuAttempts > 1) stars = 2;
  if (state.sudokuAttempts > 3) stars = 1;

  dom.sudokuModalStars.innerHTML = starStr(stars, 3);
  dom.sudokuModalMessage.textContent = state.sudokuAttempts === 1
    ? "Rozwiązałeś sudoku za pierwszym razem! 🎉"
    : `Rozwiązałeś sudoku w ${state.sudokuAttempts} próbach!`;
  showModal("sudoku-success");
  saveSudokuProgress(data.id, stars);
}

async function saveSudokuProgress(id, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sudoku_id: id, sudoku_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Save sudoku progress failed", e); }
}

function onSudokuHint() {
  if (!state.currentSudoku) return;
  const hints = state.currentSudoku.hints || [];
  if (hints.length === 0) return;
  const hint = hints[state.sudokuHintIndex % hints.length];
  state.sudokuHintIndex++;
  dom.sudokuFeedback.textContent = "💡 " + hint;
  dom.sudokuFeedback.className = "sudoku-feedback sudoku-feedback-hint";
}

function onNextSudoku() {
  hideModal("sudoku-success");
  const puzzles = state.sudokuPuzzles || [];
  if (!state.currentSudoku) return;
  const idx = puzzles.findIndex(p => p.id === state.currentSudoku.id);
  if (idx >= 0 && idx < puzzles.length - 1) {
    loadSudoku(puzzles[idx + 1].id);
  } else {
    showScreen("levels");
    // Activate sudoku tab
    dom.tabBtns.forEach(b => b.classList.remove("active"));
    const sudokuTab = document.querySelector('[data-tab="sudoku"]');
    if (sudokuTab) sudokuTab.classList.add("active");
    $$(".tab-content").forEach(tc => tc.classList.remove("active"));
    const tabEl = $("#tab-sudoku");
    if (tabEl) tabEl.classList.add("active");
    renderSudokuList();
  }
}
