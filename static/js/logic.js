/* ==========================================================
   KidCoder – Logic Game Module
   ========================================================== */

// ============ LOGIC PUZZLE LIST ============
function renderLogicPuzzles() {
  if (!dom.logicGrid) return;
  dom.logicGrid.innerHTML = "";
  (state.logicPuzzles || []).forEach(puzzle => {
    const completed = (state.progress.logic_completed || []).includes(puzzle.id);
    const stars = (state.progress.logic_stars || {})[String(puzzle.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${puzzle.id}</div>
      <h3>${esc(puzzle.title)}</h3>
      <p>${esc(puzzle.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadLogicPuzzle(puzzle.id));
    dom.logicGrid.appendChild(card);
  });
}

// ============ LOAD LOGIC PUZZLE ============
async function loadLogicPuzzle(puzzleId) {
  try {
    const res = await fetch(`${API}/api/logic/${puzzleId}`);
    state.currentLogic = await res.json();
  } catch { return; }

  state.logicHintIndex = 0;
  state.logicAttempts = 0;
  state.logicSolved = false;

  dom.logicTitle.textContent = `Zagadka ${state.currentLogic.id}: ${state.currentLogic.title}`;
  dom.logicDesc.textContent = state.currentLogic.description;
  dom.logicFeedback.textContent = "";
  dom.logicFeedback.className = "logic-feedback";

  renderLogicPuzzleContent();
  renderLogicOptions();
  showScreen("logic");
}

function renderLogicPuzzleContent() {
  const puzzle = state.currentLogic;
  let html = "";

  if (puzzle.type === "sequence") {
    html += '<div class="puzzle-sequence">';
    puzzle.sequence.forEach(item => {
      if (item === null) {
        html += '<div class="puzzle-item missing">?</div>';
      } else {
        html += `<div class="puzzle-item">${item}</div>`;
      }
    });
    html += '</div>';
  } else if (puzzle.type === "pattern") {
    html += '<div class="puzzle-sequence">';
    puzzle.pattern.forEach(item => {
      if (item === null) {
        html += '<div class="puzzle-item missing">?</div>';
      } else {
        html += `<div class="puzzle-item">${item}</div>`;
      }
    });
    html += '</div>';
  } else if (puzzle.type === "logic_if") {
    html += `<div class="puzzle-rule">${esc(puzzle.rule)}</div>`;
    html += `<div class="puzzle-condition">${esc(puzzle.condition)}</div>`;
  } else if (puzzle.type === "true_false") {
    html += `<div class="puzzle-statement">${esc(puzzle.statement)}</div>`;
  } else if (puzzle.type === "logic_gate") {
    html += `<div class="puzzle-rule">${esc(puzzle.rule)}</div>`;
  } else if (puzzle.type === "sort") {
    html += `<div class="puzzle-statement">Ułóż od najmniejszej do największej:</div>`;
    html += '<div class="puzzle-sequence">';
    puzzle.items.forEach(item => {
      html += `<div class="puzzle-item">${item}</div>`;
    });
    html += '</div>';
  } else if (puzzle.type === "find_path") {
    html += `<div class="puzzle-statement">${esc(puzzle.question)}</div>`;
    html += '<div class="puzzle-grid-visual">';
    puzzle.grid.forEach(row => {
      html += '<div class="puzzle-grid-row">';
      row.forEach(cell => {
        const cls = cell === "⬛" ? "puzzle-grid-cell wall" : "puzzle-grid-cell";
        html += `<div class="${cls}">${cell === "⬛" ? "" : cell}</div>`;
      });
      html += '</div>';
    });
    html += '</div>';
  } else if (puzzle.type === "mirror") {
    html += `<div class="puzzle-statement">${esc(puzzle.question)}</div>`;
    html += '<div class="puzzle-sequence">';
    puzzle.pattern.forEach(item => {
      html += `<div class="puzzle-item">${item}</div>`;
    });
    html += '</div>';
    html += '<div class="puzzle-mirror-arrow">🪞 Lustro 🪞</div>';
  }

  dom.logicPuzzleArea.innerHTML = html;
}

function renderLogicOptions() {
  dom.logicOptions.innerHTML = "";
  const puzzle = state.currentLogic;
  puzzle.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.className = "logic-option";
    const displayText = Array.isArray(option) ? option.join(", ") : String(option);
    btn.textContent = displayText;
    btn.addEventListener("click", () => checkLogicAnswer(option, btn));
    dom.logicOptions.appendChild(btn);
  });
}

function checkLogicAnswer(selected, btnEl) {
  if (state.logicSolved) return;
  state.logicAttempts++;

  const puzzle = state.currentLogic;
  const answer = puzzle.answer;

  let isCorrect = false;
  if (Array.isArray(answer) && Array.isArray(selected)) {
    isCorrect = JSON.stringify(answer) === JSON.stringify(selected);
  } else {
    isCorrect = selected === answer;
  }

  if (isCorrect) {
    state.logicSolved = true;
    btnEl.classList.add("correct");
    dom.logicFeedback.textContent = "✅ Prawidłowo! Świetna robota!";
    dom.logicFeedback.className = "logic-feedback correct";

    let stars = 3;
    if (state.logicAttempts === 2) stars = 2;
    if (state.logicAttempts > 2) stars = 1;

    setTimeout(() => onLogicComplete(stars), 800);
  } else {
    btnEl.classList.add("wrong");
    dom.logicFeedback.textContent = "❌ Spróbuj jeszcze raz!";
    dom.logicFeedback.className = "logic-feedback wrong";
    setTimeout(() => {
      btnEl.classList.remove("wrong");
      if (!state.logicSolved) {
        dom.logicFeedback.textContent = "";
        dom.logicFeedback.className = "logic-feedback";
      }
    }, 1200);
  }
}

function onLogicComplete(stars) {
  saveLogicProgress(state.currentLogic.id, stars);

  // If in adventure mode, mark stop complete and return to map
  if (typeof checkAdventureReturn === "function" && checkAdventureReturn()) {
    onAdventureTaskComplete();
    return;
  }

  dom.logicModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Dobry początek logicznego myślenia! 🤔",
    "Świetna logika! Prawie ideał! 🎊",
    "PERFEKCYJNIE! Jesteś mistrzem logiki! 🧠",
  ];
  dom.logicModalMessage.textContent = messages[stars - 1] || messages[2];
  dom.logicExplanation.textContent = state.currentLogic.explanation || "";
  showModal("logic-success");
}

function onNextLogic() {
  hideModal("logic-success");
  const nextId = state.currentLogic.id + 1;
  const exists = (state.logicPuzzles || []).find(p => p.id === nextId);
  if (exists) {
    loadLogicPuzzle(nextId);
  } else {
    showScreen("levels");
    renderLogicPuzzles();
  }
}

function onLogicHint() {
  const hints = state.currentLogic.hints || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Brak podpowiedzi. Dasz radę!";
  } else {
    dom.hintText.textContent = hints[state.logicHintIndex % hints.length];
    state.logicHintIndex++;
  }
  showModal("hint");
}

async function saveLogicProgress(puzzleId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logic_id: puzzleId, logic_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
