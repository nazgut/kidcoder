/* ==========================================================
   KidCoder – Thinking (Computational Thinking) Module
   ========================================================== */

// ============ EXERCISE LIST ============
function renderThinkingList() {
  if (!dom.thinkingGrid) return;
  dom.thinkingGrid.innerHTML = "";

  const typeIcons = {
    algorithm: "⚙️", sequence: "🔢", pattern: "🔄", sorting: "📊",
    debug: "🐛", decomposition: "🧩", condition: "❓", abstraction: "🎯",
    loop_trace: "🔁", default: "🧠"
  };
  const typeColors = {
    algorithm: "#0984E3", sequence: "#6C5CE7", pattern: "#E17055",
    sorting: "#00B894", debug: "#D63031", decomposition: "#FD79A8",
    condition: "#FDCB6E", abstraction: "#00CEC9", loop_trace: "#A29BFE",
    default: "#636E72"
  };

  (state.thinkingExercises || []).forEach(ex => {
    const completed = (state.progress.thinking_completed || []).includes(ex.id);
    const stars = (state.progress.thinking_stars || {})[String(ex.id)] || 0;
    const type = ex.type || "default";
    const icon = typeIcons[type] || typeIcons.default;
    const color = typeColors[type] || typeColors.default;

    const card = document.createElement("div");
    card.className = "thinking-level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="tlc-top" style="background:${color}">
        <span class="tlc-icon">${icon}</span>
        <span class="tlc-number">#${ex.id}</span>
      </div>
      <div class="tlc-body">
        <div class="tlc-title">${esc(ex.title)}</div>
        <div class="tlc-desc">${esc(ex.description)}</div>
        <div class="tlc-footer">
          <span class="tlc-badge" style="background:${color}20;color:${color}">${type.replace("_", " ")}</span>
          <span class="tlc-stars">${starStr(stars, 3)}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => loadThinkingExercise(ex.id));
    dom.thinkingGrid.appendChild(card);
  });
}

// ============ LOAD EXERCISE ============
async function loadThinkingExercise(exId) {
  try {
    const res = await fetch(`${API}/api/thinking/${exId}`);
    state.currentThinking = await res.json();
  } catch { return; }

  state.thinkingAttempts = 0;
  state.thinkingSolved = false;
  state.thinkingHintIndex = 0;

  dom.thinkingTitle.textContent = state.currentThinking.title;
  dom.thinkingFeedback.textContent = "";
  dom.thinkingFeedback.className = "logic-feedback";

  renderThinkingContent();
  showScreen("thinking");
}

// ============ RENDER EXERCISE ============
function renderThinkingContent() {
  const ex = state.currentThinking;
  const area = dom.thinkingPuzzleArea;
  const opts = dom.thinkingOptions;
  area.innerHTML = "";
  opts.innerHTML = "";

  // Instruction
  const instrEl = document.createElement("div");
  instrEl.className = "thinking-instruction";
  instrEl.textContent = ex.instruction;
  area.appendChild(instrEl);

  if (ex.type === "sequence_order") {
    renderSequenceOrder(ex, area, opts);
  } else if (ex.type === "condition") {
    renderCondition(ex, area, opts);
  } else if (ex.type === "pattern") {
    renderPattern(ex, area, opts);
  } else if (ex.type === "loop_result") {
    renderLoopResult(ex, area, opts);
  } else if (ex.type === "debugging") {
    renderDebugging(ex, area, opts);
  } else if (ex.type === "decomposition" || ex.type === "abstraction") {
    renderMultiSelect(ex, area, opts);
  } else if (ex.type === "algorithm") {
    renderAlgorithm(ex, area, opts);
  }
}

// ============ TYPE: SEQUENCE ORDER ============
function renderSequenceOrder(ex, area, opts) {
  const listEl = document.createElement("div");
  listEl.className = "thinking-sortable";

  const items = ex.items.map((item, i) => ({ text: item, origIdx: i }));
  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "thinking-sort-item";
    el.textContent = item.text;
    el.dataset.origIdx = item.origIdx;

    // Click to select, click another to swap
    el.addEventListener("click", () => {
      if (state.thinkingSolved) return;
      const selected = listEl.querySelector(".thinking-sort-selected");
      if (selected) {
        selected.classList.remove("thinking-sort-selected");
        if (selected !== el) {
          // Swap
          const parent = el.parentNode;
          const sibling = el.nextSibling === selected ? el : el.nextSibling;
          parent.insertBefore(el, selected);
          parent.insertBefore(selected, sibling);
        }
      } else {
        el.classList.add("thinking-sort-selected");
      }
    });
    listEl.appendChild(el);
  });
  area.appendChild(listEl);

  const checkBtn = document.createElement("button");
  checkBtn.className = "btn btn-primary thinking-check-btn";
  checkBtn.textContent = "✅ Sprawdź kolejność";
  checkBtn.addEventListener("click", () => {
    if (state.thinkingSolved) return;
    state.thinkingAttempts++;
    const currentOrder = [...listEl.querySelectorAll(".thinking-sort-item")].map(el => Number(el.dataset.origIdx));
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(ex.correct_order);
    handleThinkingResult(isCorrect);
  });
  opts.appendChild(checkBtn);
}

// ============ TYPE: CONDITION / PATTERN / LOOP / ALGORITHM ============
function renderCondition(ex, area, opts) {
  const scenarioEl = document.createElement("div");
  scenarioEl.className = "thinking-scenario";
  scenarioEl.textContent = ex.scenario;
  area.appendChild(scenarioEl);
  renderChoiceOptions(ex.options, ex.answer, opts);
}

function renderPattern(ex, area, opts) {
  const seqEl = document.createElement("div");
  seqEl.className = "puzzle-sequence";
  ex.sequence.forEach(item => {
    const el = document.createElement("div");
    el.className = "puzzle-item" + (item === "?" ? " missing" : "");
    el.textContent = item;
    seqEl.appendChild(el);
  });
  area.appendChild(seqEl);
  renderChoiceOptions(ex.options, ex.answer, opts);
}

function renderLoopResult(ex, area, opts) {
  const codeEl = document.createElement("pre");
  codeEl.className = "thinking-code-block";
  codeEl.textContent = ex.loop_code;
  area.appendChild(codeEl);
  renderChoiceOptions(ex.options, ex.answer, opts);
}

function renderAlgorithm(ex, area, opts) {
  if (ex.visual) {
    const gridEl = document.createElement("div");
    gridEl.className = "puzzle-grid-visual";
    ex.visual.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "puzzle-grid-row";
      row.forEach(cell => {
        const cellEl = document.createElement("div");
        cellEl.className = "puzzle-grid-cell" + (cell === "⬛" ? " wall" : "");
        cellEl.textContent = cell === "⬛" ? "" : cell;
        rowEl.appendChild(cellEl);
      });
      gridEl.appendChild(rowEl);
    });
    area.appendChild(gridEl);
  }
  renderChoiceOptions(ex.options, ex.answer, opts);
}

function renderChoiceOptions(options, answerIdx, container) {
  options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "logic-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (state.thinkingSolved) return;
      state.thinkingAttempts++;
      const isCorrect = idx === answerIdx;
      if (isCorrect) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("wrong");
        setTimeout(() => btn.classList.remove("wrong"), 1200);
      }
      handleThinkingResult(isCorrect);
    });
    container.appendChild(btn);
  });
}

// ============ TYPE: DEBUGGING ============
function renderDebugging(ex, area, opts) {
  if (ex.visual) {
    const gridEl = document.createElement("div");
    gridEl.className = "puzzle-grid-visual";
    ex.visual.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "puzzle-grid-row";
      row.forEach(cell => {
        const cellEl = document.createElement("div");
        cellEl.className = "puzzle-grid-cell" + (cell === "⬛" ? " wall" : "");
        cellEl.textContent = cell === "⬛" ? "" : cell;
        rowEl.appendChild(cellEl);
      });
      gridEl.appendChild(rowEl);
    });
    area.appendChild(gridEl);
  }

  const stepsEl = document.createElement("div");
  stepsEl.className = "thinking-steps";
  ex.steps.forEach((step, idx) => {
    const btn = document.createElement("button");
    btn.className = "thinking-step-btn";
    btn.textContent = `Krok ${idx + 1}: ${step}`;
    btn.addEventListener("click", () => {
      if (state.thinkingSolved) return;
      state.thinkingAttempts++;
      const isCorrect = idx === ex.wrong_step;
      if (isCorrect) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("wrong");
        setTimeout(() => btn.classList.remove("wrong"), 1200);
      }
      handleThinkingResult(isCorrect);
    });
    stepsEl.appendChild(btn);
  });
  opts.appendChild(stepsEl);
}

// ============ TYPE: DECOMPOSITION / ABSTRACTION ============
function renderMultiSelect(ex, area, opts) {
  const taskEl = document.createElement("div");
  taskEl.className = "thinking-scenario";
  taskEl.textContent = ex.task;
  area.appendChild(taskEl);

  const checkboxes = [];
  ex.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "thinking-checkbox-label";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.dataset.idx = idx;
    cb.className = "thinking-checkbox";
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + opt.text));
    checkboxes.push(cb);
    opts.appendChild(label);
  });

  const checkBtn = document.createElement("button");
  checkBtn.className = "btn btn-primary thinking-check-btn";
  checkBtn.textContent = "✅ Sprawdź odpowiedź";
  checkBtn.addEventListener("click", () => {
    if (state.thinkingSolved) return;
    state.thinkingAttempts++;
    const selected = checkboxes.map(cb => cb.checked);
    const correct = ex.options.map(o => o.correct);
    const isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    handleThinkingResult(isCorrect);
  });
  opts.appendChild(checkBtn);
}

// ============ RESULT HANDLING ============
function handleThinkingResult(isCorrect) {
  if (isCorrect) {
    state.thinkingSolved = true;
    dom.thinkingFeedback.textContent = "✅ Brawo! Świetne myślenie!";
    dom.thinkingFeedback.className = "logic-feedback correct";
    let stars = 3;
    if (state.thinkingAttempts === 2) stars = 2;
    if (state.thinkingAttempts > 2) stars = 1;
    setTimeout(() => onThinkingComplete(stars), 800);
  } else {
    dom.thinkingFeedback.textContent = "❌ Spróbuj jeszcze raz!";
    dom.thinkingFeedback.className = "logic-feedback wrong";
    setTimeout(() => {
      if (!state.thinkingSolved) {
        dom.thinkingFeedback.textContent = "";
        dom.thinkingFeedback.className = "logic-feedback";
      }
    }, 1200);
  }
}

function onThinkingComplete(stars) {
  saveThinkingProgress(state.currentThinking.id, stars);
  dom.thinkingModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Dobry początek myślenia komputerowego! 🤔",
    "Świetne myślenie! Prawie perfekcyjnie! 🎊",
    "PERFEKCYJNIE! Myślisz jak programista! 🧠",
  ];
  dom.thinkingModalMessage.textContent = messages[stars - 1] || messages[2];
  dom.thinkingExplanation.textContent = state.currentThinking.explanation || "";
  showModal("thinking-success");
}

function onNextThinking() {
  hideModal("thinking-success");
  const nextId = state.currentThinking.id + 1;
  const exists = (state.thinkingExercises || []).find(e => e.id === nextId);
  if (exists) {
    loadThinkingExercise(nextId);
  } else {
    showScreen("levels");
    renderThinkingList();
  }
}

function onThinkingHint() {
  const hints = state.currentThinking.hints || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Brak podpowiedzi. Dasz radę!";
  } else {
    dom.hintText.textContent = hints[state.thinkingHintIndex % hints.length];
    state.thinkingHintIndex++;
  }
  showModal("hint");
}

async function saveThinkingProgress(exId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thinking_id: exId, thinking_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Thinking save failed", e); }
}
