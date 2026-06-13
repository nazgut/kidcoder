/* ==========================================================
   KidCoder – Math Game Module (multiplication & division)
   ========================================================== */

function renderMathList() {
  const grid = dom.mathGrid;
  if (!grid) return;
  grid.innerHTML = "";
  const problems = state.mathProblems || [];
  const completed = state.progress.math_completed || [];
  const starsMap = state.progress.math_stars || {};

  problems.forEach(p => {
    const done = completed.includes(p.id);
    const s = starsMap[String(p.id)] || 0;
    const isDiv = p.type === "divide";
    const typeLabel = isDiv ? "÷ Dzielenie" : "× Mnożenie";
    const typeColor = isDiv ? "#E17055" : "#00B894";

    const card = document.createElement("div");
    card.className = "level-card math-level-card" + (done ? " completed" : "");
    card.innerHTML = `
      <div class="math-card-icon">${isDiv ? "➗" : "✖️"}</div>
      <div class="level-number math-level-num" style="background:${typeColor}">${p.id}</div>
      <h3>${esc(p.title)}</h3>
      <p class="math-type-badge" style="color:${typeColor}">${typeLabel}</p>
      <div class="level-stars">${done ? starStr(s, 3) : "☆☆☆"}</div>`;
    card.addEventListener("click", () => loadMath(p.id));
    grid.appendChild(card);
  });
}

async function loadMath(id) {
  try {
    const res = await fetch(`${API}/api/math/${id}`);
    if (!res.ok) return;
    state.currentMath = await res.json();
  } catch { return; }

  state.mathAttempts = 0;
  state.mathSolved = false;
  state.mathHintIndex = 0;

  const m = state.currentMath;
  dom.mathTitle.textContent = m.title;
  dom.mathFeedback.textContent = "";
  dom.mathFeedback.className = "logic-feedback";

  renderMathProblem();
  showScreen("math");
}

function renderMathProblem() {
  const m = state.currentMath;
  const isDiv = m.type === "divide";

  // Visual display
  dom.mathVisual.textContent = m.visual || "";

  // Problem display
  dom.mathProblemDisplay.innerHTML = `
    <div class="math-problem-equation">${esc(m.problem)}</div>
  `;

  // Description
  dom.mathDesc.textContent = m.description;

  // Answer options
  dom.mathOptions.innerHTML = "";
  const shuffled = [...m.options].sort(() => Math.random() - 0.5);
  shuffled.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "math-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleMathAnswer(opt, btn));
    dom.mathOptions.appendChild(btn);
  });
}

function handleMathAnswer(chosen, btn) {
  if (state.mathSolved) return;
  const m = state.currentMath;
  state.mathAttempts++;

  if (chosen === m.answer) {
    state.mathSolved = true;
    btn.classList.add("correct");
    dom.mathFeedback.textContent = "🎉 Brawo! Świetna robota!";
    dom.mathFeedback.className = "logic-feedback correct";

    const stars = state.mathAttempts === 1 ? 3 : state.mathAttempts === 2 ? 2 : 1;
    saveMathProgress(m.id, stars);

    setTimeout(() => {
      dom.mathModalStars.textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
      dom.mathModalMessage.textContent = m.explanation;
      showModal("math-success");
    }, 700);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    dom.mathFeedback.textContent = "❌ Nie tym razem! Spróbuj jeszcze raz.";
    dom.mathFeedback.className = "logic-feedback wrong";
    setTimeout(() => {
      btn.classList.remove("wrong");
    }, 800);
  }
}

function onMathHint() {
  const m = state.currentMath;
  if (!m || !m.hints || m.hints.length === 0) return;
  const hint = m.hints[state.mathHintIndex % m.hints.length];
  state.mathHintIndex++;
  dom.hintText.textContent = hint;
  showModal("hint");
}

function onNextMath() {
  hideModal("math-success");
  const problems = state.mathProblems || [];
  const currentId = state.currentMath ? state.currentMath.id : 0;
  const next = problems.find(p => p.id > currentId);
  if (next) {
    loadMath(next.id);
  } else {
    showScreen("levels");
    renderMathList();
  }
}

async function saveMathProgress(mathId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ math_id: mathId, math_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
    renderMathList();
  } catch (e) { console.error("Save math progress failed", e); }
}
