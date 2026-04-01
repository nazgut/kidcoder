/* ==========================================================
   KidCoder – Quiz Module (Programming & Logic Quiz)
   ========================================================== */

function renderQuizList() {
  if (!dom.quizGrid) return;
  const qs = state.quizQuestions;
  const p = state.progress;
  dom.quizGrid.innerHTML = "";

  qs.forEach((q, i) => {
    const done = (p.quiz_completed || []).includes(q.id);
    const stars = (p.quiz_stars || {})[String(q.id)] || 0;
    const card = document.createElement("div");
    card.className = "level-card" + (done ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${i + 1}</div>
      <div class="level-name">${esc(q.title)}</div>
      <div class="level-stars">${done ? starStr(stars, 3) : "☆☆☆"}</div>
    `;
    card.addEventListener("click", () => loadQuiz(q.id));
    dom.quizGrid.appendChild(card);
  });
}

async function loadQuiz(id) {
  try {
    const res = await fetch(`${API}/api/quiz/${id}`);
    if (!res.ok) throw new Error("fetch");
    state.currentQuiz = await res.json();
  } catch {
    const q = state.quizQuestions.find(q => q.id === id);
    if (q) state.currentQuiz = q;
    else return;
  }
  state.quizAttempts = 0;
  state.quizSolved = false;
  state.quizHintIndex = 0;

  dom.quizTitle.textContent = "💡 " + state.currentQuiz.title;
  dom.quizDesc.textContent = state.currentQuiz.description || "";
  dom.quizFeedback.textContent = "";
  dom.quizFeedback.className = "logic-feedback";

  renderQuizContent();
  showScreen("quiz");
}

function renderQuizContent() {
  const q = state.currentQuiz;
  if (!q) return;

  // Show code block if present
  if (q.code && dom.quizCode) {
    dom.quizCode.textContent = q.code;
    dom.quizCode.style.display = "block";
  } else if (dom.quizCode) {
    dom.quizCode.style.display = "none";
  }

  // Show description / question text in content area
  if (dom.quizContent) {
    dom.quizContent.innerHTML = `<p class="logic-desc" style="font-size:1.1rem">${esc(q.question || "")}</p>`;
  }

  // Multiple choice options
  renderQuizOptions();
}

function renderQuizOptions() {
  const q = state.currentQuiz;
  if (!dom.quizOptions || !q) return;
  dom.quizOptions.innerHTML = "";

  const options = q.options || [];
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "logic-option-btn";
    btn.textContent = opt;
    if (state.quizSolved) {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
    }
    btn.addEventListener("click", () => checkQuizAnswer(i));
    dom.quizOptions.appendChild(btn);
  });
}

function checkQuizAnswer(index) {
  if (state.quizSolved) return;
  const q = state.currentQuiz;
  state.quizAttempts++;

  if (index === q.correct) {
    state.quizSolved = true;
    dom.quizFeedback.textContent = "✅ Brawo! Poprawna odpowiedź!";
    dom.quizFeedback.className = "logic-feedback correct";
    renderQuizOptions();

    let stars = 3;
    if (state.quizAttempts === 2) stars = 2;
    else if (state.quizAttempts >= 3) stars = 1;
    setTimeout(() => onQuizComplete(stars), 800);
  } else {
    dom.quizFeedback.textContent = "❌ Spróbuj ponownie!";
    dom.quizFeedback.className = "logic-feedback incorrect";
    // highlight wrong answer
    const btns = dom.quizOptions.querySelectorAll(".logic-option-btn");
    if (btns[index]) btns[index].classList.add("wrong");
  }
}

async function onQuizComplete(stars) {
  await saveQuizProgress(state.currentQuiz.id, stars);
  // If in adventure mode, mark stop complete and return to map
  if (typeof checkAdventureReturn === "function" && checkAdventureReturn()) {
    onAdventureTaskComplete();
    return;
  }
  dom.quizModalStars.textContent = starStr(stars, 3);
  dom.quizModalMessage.textContent = stars === 3 ? "Perfekcyjnie! 🏆" : stars === 2 ? "Bardzo dobrze! 👏" : "Udało się! 👍";
  if (dom.quizExplanation) {
    dom.quizExplanation.textContent = state.currentQuiz.explanation || "";
  }
  showModal("quiz-success");
}

async function saveQuizProgress(quizId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: quizId, quiz_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Save quiz failed", e); }
}

function onNextQuiz() {
  hideModal("quiz-success");
  const qs = state.quizQuestions;
  const idx = qs.findIndex(q => q.id === state.currentQuiz.id);
  if (idx >= 0 && idx < qs.length - 1) {
    loadQuiz(qs[idx + 1].id);
  } else {
    showScreen("levels");
    renderQuizList();
  }
}

function onQuizHint() {
  const q = state.currentQuiz;
  if (!q || !q.hints || !q.hints.length) return;
  const hint = q.hints[state.quizHintIndex % q.hints.length];
  state.quizHintIndex++;
  dom.quizFeedback.textContent = "💡 " + hint;
  dom.quizFeedback.className = "logic-feedback hint";
}
