/* ==========================================================
   KidCoder – Debug Module (znajdź błąd w programie)
   Dziecko czyta kroki programu i klika ten z błędem.
   ========================================================== */

// ============ DEBUG LIST ============
function renderDebugList() {
  if (!dom.debugGrid) return;
  dom.debugGrid.innerHTML = "";
  (state.debugPuzzles || []).forEach(puzzle => {
    const completed = (state.progress.debug_completed || []).includes(puzzle.id);
    const stars = (state.progress.debug_stars || {})[String(puzzle.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${puzzle.id}</div>
      <h3>${esc(puzzle.title)}</h3>
      <p>${esc(puzzle.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadDebugPuzzle(puzzle.id));
    dom.debugGrid.appendChild(card);
  });
}

// ============ LOAD PUZZLE ============
async function loadDebugPuzzle(puzzleId) {
  try {
    const res = await fetch(`${API}/api/debug/${puzzleId}`);
    state.currentDebug = await res.json();
  } catch { return; }

  const p = state.currentDebug;
  state.debugSolved = false;
  state.debugAttempts = 0;
  state.debugHintIndex = 0;

  dom.debugTitle.textContent = p.title;
  dom.debugStory.textContent = p.story;
  dom.debugFeedback.textContent = "";
  dom.debugFeedback.className = "logic-feedback";

  renderDebugSteps();
  showScreen("debug");
}

// ============ STEPS ============
function renderDebugSteps() {
  const p = state.currentDebug;
  dom.debugSteps.innerHTML = "";
  p.steps.forEach((step, i) => {
    const line = document.createElement("button");
    line.className = "debug-step";
    line.dataset.step = i;
    line.innerHTML = `<span class="debug-step-no">${i + 1}</span><span class="debug-step-text">${esc(step)}</span>`;
    line.addEventListener("click", () => onDebugStepClick(i));
    dom.debugSteps.appendChild(line);
  });
}

function onDebugStepClick(i) {
  if (state.debugSolved) return;
  const p = state.currentDebug;
  state.debugAttempts++;
  const line = dom.debugSteps.querySelector(`[data-step="${i}"]`);

  if (i === p.bug_index) {
    state.debugSolved = true;
    line.classList.add("bug-found");
    const fix = document.createElement("div");
    fix.className = "debug-fix";
    fix.innerHTML = `<span class="debug-fix-label">✅ Poprawka:</span> ${esc(p.fix)}`;
    line.after(fix);

    dom.debugFeedback.textContent = "🐞 Błąd znaleziony! Jesteś prawdziwym debuggerem!";
    dom.debugFeedback.className = "logic-feedback correct";

    let stars = 3;
    if (state.debugAttempts === 2) stars = 2;
    if (state.debugAttempts > 2) stars = 1;
    setTimeout(() => onDebugComplete(stars), 1400);
  } else {
    line.classList.add("wrong-step");
    dom.debugFeedback.textContent = "❌ Ten krok jest w porządku. Czytaj dalej!";
    dom.debugFeedback.className = "logic-feedback wrong";
    setTimeout(() => {
      line.classList.remove("wrong-step");
      if (!state.debugSolved) {
        dom.debugFeedback.textContent = "";
        dom.debugFeedback.className = "logic-feedback";
      }
    }, 1100);
  }
}

// ============ COMPLETE ============
function onDebugComplete(stars) {
  saveDebugProgress(state.currentDebug.id, stars);

  dom.debugModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Błąd znaleziony! Debugowanie wymaga cierpliwości 🔍",
    "Świetne oko! Prawie od razu! 🐞",
    "PERFEKCYJNIE! Znajdujesz błędy jak zawodowy programista! 💻",
  ];
  dom.debugModalMessage.textContent = messages[stars - 1] || messages[2];
  dom.debugExplanation.textContent = state.currentDebug.explanation || "";
  showModal("debug-success");
}

function onNextDebug() {
  hideModal("debug-success");
  const nextId = state.currentDebug.id + 1;
  const exists = (state.debugPuzzles || []).find(p => p.id === nextId);
  if (exists) {
    loadDebugPuzzle(nextId);
  } else {
    showScreen("levels");
    renderDebugList();
  }
}

function onDebugHint() {
  const hints = (state.currentDebug && state.currentDebug.hints) || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Wyobraź sobie, że wykonujesz każdy krok. Który się nie uda?";
  } else {
    dom.hintText.textContent = hints[state.debugHintIndex % hints.length];
    state.debugHintIndex++;
  }
  showModal("hint");
}

async function saveDebugProgress(puzzleId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debug_id: puzzleId, debug_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
