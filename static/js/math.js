/* ==========================================================
   KidCoder – Math Game Module (multiplication & division)
   Visual types: groups | split | array | number_line
   ========================================================== */

const LESSON_BADGE = {
  lesson:    { icon: "📖", label: "LEKCJA",    cls: "math-badge-lesson" },
  test:      { icon: "🧪", label: "TEST",       cls: "math-badge-test" },
  practice:  { icon: "🏃", label: "ĆWICZENIE", cls: "math-badge-practice" },
  challenge: { icon: "🏆", label: "WYZWANIE",  cls: "math-badge-challenge" },
};

// ─── LIST ───────────────────────────────────────────────────

function renderMathList() {
  const grid = dom.mathGrid;
  if (!grid) return;
  grid.innerHTML = "";
  const problems = state.mathProblems || [];
  const completed = state.progress.math_completed || [];
  const starsMap  = state.progress.math_stars   || {};

  problems.forEach(p => {
    const done  = completed.includes(p.id);
    const s     = starsMap[String(p.id)] || 0;
    const isDiv = p.type === "divide";
    const lt    = LESSON_BADGE[p.lesson_type] || LESSON_BADGE.practice;
    const accentColor = isDiv ? "#E17055" : "#00B894";
    const tableLabel  = p.table ? `× ${p.table}` : "";

    const card = document.createElement("div");
    card.className = "level-card math-level-card" + (done ? " completed" : "");
    card.style.setProperty("--math-accent", accentColor);
    card.innerHTML = `
      <div class="math-card-badge ${lt.cls}">${lt.icon} ${lt.label}</div>
      <div class="level-number math-level-num" style="background:${accentColor}">${p.id}</div>
      <h3>${esc(p.title)}</h3>
      <p class="math-type-badge" style="color:${accentColor}">${isDiv ? "÷" : "×"} Tabela ${tableLabel}</p>
      <div class="level-stars">${done ? starStr(s, 3) : "☆☆☆"}</div>`;
    card.addEventListener("click", () => loadMath(p.id));
    grid.appendChild(card);
  });
}

// ─── LOAD ───────────────────────────────────────────────────

async function loadMath(id) {
  try {
    const res = await fetch(`${API}/api/math/${id}`);
    if (!res.ok) return;
    state.currentMath = await res.json();
  } catch { return; }

  state.mathAttempts = 0;
  state.mathSolved   = false;
  state.mathHintIndex = 0;

  const m = state.currentMath;
  const lt = LESSON_BADGE[m.lesson_type] || LESSON_BADGE.practice;
  dom.mathTitle.textContent = `${lt.icon} ${m.title}`;
  dom.mathFeedback.textContent = "";
  dom.mathFeedback.className   = "logic-feedback";

  renderMathProblem();
  showScreen("math");
}

// ─── RENDER PROBLEM ─────────────────────────────────────────

function renderMathProblem() {
  const m = state.currentMath;

  // Story / description
  dom.mathDesc.textContent = m.story || m.description || "";

  // Lesson text box
  const lessonBox = document.getElementById("math-lesson-box");
  if (lessonBox) {
    if (m.lesson_text) {
      lessonBox.textContent = m.lesson_text;
      lessonBox.style.display = "";
    } else {
      lessonBox.style.display = "none";
    }
  }

  // Visual panel
  dom.mathVisual.innerHTML = buildMathVisual(m);

  // Equation
  dom.mathProblemDisplay.innerHTML =
    `<div class="math-problem-equation">${esc(m.problem)}</div>`;

  // Answer buttons (shuffled)
  dom.mathOptions.innerHTML = "";
  [...m.options].sort(() => Math.random() - 0.5).forEach(opt => {
    const btn = document.createElement("button");
    btn.className   = "math-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleMathAnswer(opt, btn));
    dom.mathOptions.appendChild(btn);
  });
}

// ─── VISUAL BUILDERS ────────────────────────────────────────

function buildMathVisual(m) {
  switch (m.visual_type) {
    case "groups":      return buildGroupsVisual(m);
    case "split":       return buildSplitVisual(m);
    case "array":       return buildArrayVisual(m);
    case "number_line": return buildNumberLineVisual(m);
    default:            return `<div class="math-visual-plain">${esc(m.visual || "")}</div>`;
  }
}

/* Groups – N clearly-separated boxes, each with M emoji
   Shows a step-counter underneath: +b → total */
function buildGroupsVisual(m) {
  const groups   = m.visual_groups    || m.a;
  const perGroup = m.visual_per_group || m.b;
  const emoji    = m.visual_emoji || "🔵";
  const label    = m.visual_group_label || "Grupa";

  let html = `<div class="mg-wrap">`;
  html += `<div class="mg-groups">`;

  for (let g = 0; g < groups; g++) {
    html += `<div class="mg-group">`;
    html += `<div class="mg-items">`;
    for (let i = 0; i < perGroup; i++) {
      html += `<span class="mg-item">${emoji}</span>`;
    }
    html += `</div>`;
    html += `<div class="mg-label">${esc(label)} ${g + 1}</div>`;
    html += `</div>`;
  }

  html += `</div>`;  // .mg-groups

  // Counting strip: 2 → 4 → 6
  html += `<div class="mg-count-strip">`;
  let running = 0;
  for (let g = 0; g < groups; g++) {
    running += perGroup;
    if (g > 0) html += `<span class="mg-count-arrow">+${perGroup}</span>`;
    html += `<span class="mg-count-num ${g === groups - 1 ? "mg-count-final" : ""}">${running}</span>`;
  }
  html += `</div>`;

  html += `</div>`;  // .mg-wrap
  return html;
}

/* Split – M emoji scattered at top, arrow, then N buckets
   Reveals how the total breaks into equal parts */
function buildSplitVisual(m) {
  const total      = m.visual_total   || m.a;
  const groups     = m.visual_groups  || m.b;
  const emoji      = m.visual_emoji   || "🔵";
  const label      = m.visual_group_label || "Grupa";
  const perGroup   = Math.floor(total / groups);
  const displayTot = m.visual_note ? parseInt(m.visual_note) : total;

  let html = `<div class="ms-wrap">`;

  // Source pile
  html += `<div class="ms-source">`;
  html += `<div class="ms-source-label">Razem: <strong>${displayTot}</strong></div>`;
  html += `<div class="ms-source-items">`;
  for (let i = 0; i < total; i++) {
    html += `<span class="ms-item">${emoji}</span>`;
  }
  html += `</div>`;
  html += `</div>`;

  // Arrow / divider line
  html += `<div class="ms-divider">`;
  html += `<div class="ms-divider-line"></div>`;
  html += `<div class="ms-divider-label">÷ ${groups} = po ile?</div>`;
  html += `<div class="ms-divider-line"></div>`;
  html += `</div>`;

  // Destination buckets
  html += `<div class="ms-buckets">`;
  for (let g = 0; g < groups; g++) {
    html += `<div class="ms-bucket">`;
    html += `<div class="ms-bucket-items">`;
    for (let i = 0; i < perGroup; i++) {
      html += `<span class="ms-item">${emoji}</span>`;
    }
    html += `</div>`;
    html += `<div class="ms-bucket-label">${esc(label)} ${g + 1}</div>`;
    html += `</div>`;
  }
  html += `</div>`;  // .ms-buckets

  // Result highlight
  html += `<div class="ms-result-note">Każda grupa: <strong>${perGroup}</strong></div>`;

  html += `</div>`;  // .ms-wrap
  return html;
}

/* Array – rows × cols grid of emoji (for square-ish products) */
function buildArrayVisual(m) {
  const rows  = m.visual_rows || m.a;
  const cols  = m.visual_cols || m.b;
  const emoji = m.visual_emoji || "🔵";

  let html = `<div class="ma-wrap">`;
  html += `<div class="ma-grid" style="--ma-cols:${cols}">`;

  for (let r = 0; r < rows; r++) {
    html += `<div class="ma-row">`;
    for (let c = 0; c < cols; c++) {
      html += `<span class="ma-item">${emoji}</span>`;
    }
    html += `</div>`;
    // Running total after each row
    const rowTotal = (r + 1) * cols;
    html += `<div class="ma-row-total">${rowTotal}</div>`;
  }

  html += `</div>`;
  html += `<div class="ma-legend">${rows} wiersze × ${cols} kolumny = ${rows * cols}</div>`;
  html += `</div>`;
  return html;
}

/* Number line – jump visualization for ×10 and skip-counting */
function buildNumberLineVisual(m) {
  const jump  = m.visual_jump  || m.b;
  const jumps = m.visual_jumps || m.a;
  const end   = m.visual_end   || jump * jumps;

  let html = `<div class="nl-wrap">`;

  // Labels row
  html += `<div class="nl-labels">`;
  for (let j = 0; j <= jumps; j++) {
    html += `<div class="nl-label">${j * jump}</div>`;
  }
  html += `</div>`;

  // Track + arcs
  html += `<div class="nl-track">`;
  html += `<div class="nl-line"></div>`;
  for (let j = 0; j < jumps; j++) {
    const pct = (j / jumps) * 100;
    const widthPct = (1 / jumps) * 100;
    html += `<div class="nl-arc" style="left:${pct}%;width:${widthPct}%">`;
    html += `<div class="nl-arc-label">+${jump}</div>`;
    html += `</div>`;
  }
  // Dots at each position
  for (let j = 0; j <= jumps; j++) {
    const pct = (j / jumps) * 100;
    html += `<div class="nl-dot ${j === jumps ? 'nl-dot-end' : ''}" style="left:${pct}%"></div>`;
  }
  html += `</div>`;  // .nl-track

  html += `<div class="nl-result">Od 0, ${jumps} skok${jumps > 1 ? "i" : ""} po ${jump} = <strong>${end}</strong></div>`;
  html += `</div>`;
  return html;
}

// ─── ANSWER HANDLING ────────────────────────────────────────

function handleMathAnswer(chosen, btn) {
  if (state.mathSolved) return;
  const m = state.currentMath;
  state.mathAttempts++;

  if (chosen === m.answer) {
    state.mathSolved = true;
    btn.classList.add("correct");
    dom.mathFeedback.textContent = "🎉 Brawo! Świetna robota!";
    dom.mathFeedback.className   = "logic-feedback correct";

    const stars = state.mathAttempts === 1 ? 3 : state.mathAttempts === 2 ? 2 : 1;
    saveMathProgress(m.id, stars);

    setTimeout(() => {
      dom.mathModalStars.textContent  = "⭐".repeat(stars) + "☆".repeat(3 - stars);
      dom.mathModalMessage.textContent = m.explanation;
      showModal("math-success");
    }, 700);

  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    dom.mathFeedback.textContent = "❌ Nie tym razem! Spróbuj jeszcze raz.";
    dom.mathFeedback.className   = "logic-feedback wrong";
    setTimeout(() => btn.classList.remove("wrong"), 800);
  }
}

// ─── HINT / NEXT ────────────────────────────────────────────

function onMathHint() {
  const m = state.currentMath;
  if (!m?.hints?.length) return;
  dom.hintText.textContent = m.hints[state.mathHintIndex % m.hints.length];
  state.mathHintIndex++;
  showModal("hint");
}

function onNextMath() {
  hideModal("math-success");
  const problems  = state.mathProblems || [];
  const currentId = state.currentMath?.id ?? 0;
  const next      = problems.find(p => p.id > currentId);
  if (next) loadMath(next.id);
  else { showScreen("levels"); renderMathList(); }
}

// ─── SAVE PROGRESS ──────────────────────────────────────────

async function saveMathProgress(mathId, stars) {
  try {
    const res = await fetch(
      `${API}/api/progress/${encodeURIComponent(state.username)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ math_id: mathId, math_stars: stars }),
      }
    );
    state.progress = await res.json();
    updateStarDisplay();
    renderMathList();
  } catch (e) { console.error("Save math progress failed", e); }
}
