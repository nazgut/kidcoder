/* ==========================================================
   KidCoder – Typing Lesson Module
   ========================================================== */

// ============ TYPING LESSON LIST ============
function renderTypingLessons() {
  if (!dom.typingGrid) return;
  dom.typingGrid.innerHTML = "";
  state.typingLessons.forEach(lesson => {
    const completed = (state.progress.typing_completed || []).includes(lesson.id);
    const stars = (state.progress.typing_stars || {})[String(lesson.id)] || 0;
    const bestWpm = (state.progress.typing_best_wpm || {})[String(lesson.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${lesson.id}</div>
      <h3>${esc(lesson.title)}</h3>
      <p>${esc(lesson.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
      ${bestWpm ? `<div style="font-size:0.8rem;color:#636E72;margin-top:4px">Najlepsze: ${bestWpm} WPM</div>` : ""}
      <button class="btn btn-small btn-car-bonus" title="Wyścig literek!">🏎️ Wyścig</button>
    `;
    card.querySelector("h3").addEventListener("click", (e) => { e.stopPropagation(); loadTypingLesson(lesson.id); });
    card.querySelector("p").addEventListener("click", (e) => { e.stopPropagation(); loadTypingLesson(lesson.id); });
    card.querySelector(".level-number").addEventListener("click", (e) => { e.stopPropagation(); loadTypingLesson(lesson.id); });
    card.querySelector(".level-stars").addEventListener("click", (e) => { e.stopPropagation(); loadTypingLesson(lesson.id); });
    card.querySelector(".btn-car-bonus").addEventListener("click", (e) => {
      e.stopPropagation();
      launchCarGameForLesson(lesson.id);
    });
    card.addEventListener("click", () => loadTypingLesson(lesson.id));
    dom.typingGrid.appendChild(card);
  });
}

async function launchCarGameForLesson(lessonId) {
  try {
    const res = await fetch(`${API}/api/typing/${lessonId}`);
    const lesson = await res.json();
    const chars = lesson.chars || lesson.words.join("").replace(/\s/g, "");
    startCarGame(lessonId, chars);
  } catch (e) { console.error("Nie udało się załadować lekcji", e); }
}

// ============ LOAD TYPING LESSON ============
async function loadTypingLesson(lessonId) {
  try {
    const res = await fetch(`${API}/api/typing/${lessonId}`);
    state.currentTyping = await res.json();
  } catch { return; }

  dom.typingTitle.textContent = `Lekcja ${state.currentTyping.id}: ${state.currentTyping.title}`;
  dom.typingDesc.textContent = state.currentTyping.description;

  buildTypingText();
  resetTyping();
  renderKeyboard();
  showScreen("typing");
  dom.typingInput.focus();
}

function buildTypingText() {
  const lesson = state.currentTyping;
  const words = [...lesson.words];
  const shuffled = [];
  for (let r = 0; r < 2; r++) {
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    shuffled.push(...words);
  }
  state.typingText = shuffled.join(" ");
}

function resetTyping() {
  state.typingPos = 0;
  state.typingCorrect = 0;
  state.typingErrors = 0;
  state.typingStarted = false;
  state.typingFinished = false;
  state.typingStartTime = null;
  state.typingLastKeyTime = null;
  state.typingTimeLeft = state.currentTyping.time_limit;

  if (state.typingTimerInterval) {
    clearInterval(state.typingTimerInterval);
    state.typingTimerInterval = null;
  }

  dom.typingInput.value = "";
  dom.typingInput.disabled = false;
  dom.typingInput.classList.remove("input-error", "input-correct");
  dom.typingTimer.textContent = `⏱ ${state.typingTimeLeft}s`;
  dom.typingWpm.textContent = "🚀 0 WPM";
  dom.statAccuracy.textContent = "100%";
  dom.statSpeed.textContent = "0";
  dom.statCorrect.textContent = "0";
  dom.statErrors.textContent = "0";

  updateTypingDisplay();
  clearKeyboardHighlights();
  highlightNextKey();
}

function stopTyping() {
  if (state.typingTimerInterval) {
    clearInterval(state.typingTimerInterval);
    state.typingTimerInterval = null;
  }
  state.typingFinished = true;
}

// ============ TYPING DISPLAY ============
function updateTypingDisplay() {
  const text = state.typingText;
  const pos = state.typingPos;
  dom.typingDone.textContent = text.substring(0, pos);
  dom.typingCurrent.textContent = text[pos] || "";
  dom.typingRemaining.textContent = text.substring(pos + 1);
  if (dom.typingCurrent.textContent) {
    dom.typingCurrent.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// ============ TYPING INPUT HANDLER ============
function onTypingInput() {
  if (state.typingFinished) return;
  state.typingLastKeyTime = Date.now();

  if (!state.typingStarted) {
    state.typingStarted = true;
    state.typingStartTime = Date.now();
    state.typingTimerInterval = setInterval(typingTick, 1000);
  }

  const inputVal = dom.typingInput.value;
  if (inputVal.length === 0) return;

  const lastChar = inputVal[inputVal.length - 1];
  const expected = state.typingText[state.typingPos];

  if (lastChar === expected) {
    state.typingCorrect++;
    state.typingPos++;
    dom.typingInput.value = "";
    dom.typingInput.classList.remove("input-error");
    dom.typingInput.classList.add("input-correct");
    setTimeout(() => dom.typingInput.classList.remove("input-correct"), 150);
    markKey(expected, "correct");
  } else {
    state.typingErrors++;
    dom.typingInput.value = "";
    dom.typingInput.classList.remove("input-correct");
    dom.typingInput.classList.add("input-error");
    setTimeout(() => dom.typingInput.classList.remove("input-error"), 300);
    markKey(lastChar, "wrong");
  }

  updateTypingDisplay();
  updateTypingStats();
  highlightNextKey();

  if (state.typingPos >= state.typingText.length) {
    finishTyping();
  }
}

function typingTick() {
  state.typingTimeLeft--;
  dom.typingTimer.textContent = `⏱ ${state.typingTimeLeft}s`;
  updateTypingStats();

  if (state.typingTimeLeft <= 0) {
    if (state.typingLastKeyTime && (Date.now() - state.typingLastKeyTime) < 5000) {
      state.typingTimeLeft = 30;
      dom.typingTimer.textContent = `⏱ ${state.typingTimeLeft}s`;
      return;
    }
    finishTyping();
  }
}

function updateTypingStats() {
  const total = state.typingCorrect + state.typingErrors;
  const accuracy = total > 0 ? Math.round((state.typingCorrect / total) * 100) : 100;
  const elapsed = state.typingStartTime ? (Date.now() - state.typingStartTime) / 60000 : 0;
  const wpm = elapsed > 0 ? Math.round((state.typingCorrect / 5) / elapsed) : 0;

  dom.statAccuracy.textContent = accuracy + "%";
  dom.statSpeed.textContent = wpm;
  dom.statCorrect.textContent = state.typingCorrect;
  dom.statErrors.textContent = state.typingErrors;
  dom.typingWpm.textContent = `🚀 ${wpm} WPM`;
}

function finishTyping() {
  stopTyping();
  dom.typingInput.disabled = true;

  const total = state.typingCorrect + state.typingErrors;
  const accuracy = total > 0 ? Math.round((state.typingCorrect / total) * 100) : 100;
  const elapsed = state.typingStartTime ? (Date.now() - state.typingStartTime) / 60000 : 0.01;
  const wpm = Math.round((state.typingCorrect / 5) / elapsed);

  let stars = 1;
  const minWpm = state.currentTyping.min_wpm || 5;
  if (wpm >= minWpm && accuracy >= 80) stars = 2;
  if (wpm >= minWpm * 2 && accuracy >= 90) stars = 3;

  saveTypingProgress(state.currentTyping.id, stars, wpm);

  dom.typingResultStars.textContent = starStr(stars, 3);
  dom.resultWpm.textContent = wpm;
  dom.resultAccuracy.textContent = accuracy + "%";

  const messages = [
    "Dobry początek! Ćwicz dalej! 💪",
    "Świetna robota! Coraz szybciej! 🎊",
    "PERFEKCYJNIE! Mistrz klawiatury! 🏆",
  ];
  dom.typingResultTitle.textContent = stars === 3 ? "🏆 Perfekcyjnie!" : stars === 2 ? "🎊 Świetnie!" : "💪 Nieźle!";
  dom.typingResultMessage.textContent = messages[stars - 1];

  dom.btnTypingNext.textContent = "🏎️ Wyścig literek!";
  showModal("typing-result");
}

async function saveTypingProgress(lessonId, stars, wpm) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing_id: lessonId, typing_stars: stars, typing_wpm: wpm }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}

function onNextTypingLesson() {
  hideModal("typing-result");
  const chars = state.currentTyping.chars || state.currentTyping.words.join("").replace(/\s/g, "");
  startCarGame(state.currentTyping.id, chars);
}

// ============ KEYBOARD VISUAL ============
const KB_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
  [" "],
];

function renderKeyboard() {
  if (!dom.keyboardVisual) return;
  dom.keyboardVisual.innerHTML = "";
  KB_ROWS.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    row.forEach(key => {
      const keyEl = document.createElement("div");
      keyEl.className = "kb-key" + (key === " " ? " space" : "");
      keyEl.dataset.key = key;
      keyEl.textContent = key === " " ? "spacja" : key.toUpperCase();
      rowEl.appendChild(keyEl);
    });
    dom.keyboardVisual.appendChild(rowEl);
  });
}

function highlightNextKey() {
  clearKeyboardHighlights();
  if (state.typingPos >= state.typingText.length) return;
  const nextChar = state.typingText[state.typingPos].toLowerCase();
  const keyEl = dom.keyboardVisual.querySelector(`[data-key="${CSS.escape(nextChar)}"]`);
  if (keyEl) keyEl.classList.add("active");
}

function markKey(char, cls) {
  const keyEl = dom.keyboardVisual.querySelector(`[data-key="${CSS.escape(char.toLowerCase())}"]`);
  if (keyEl) {
    keyEl.classList.add(cls);
    setTimeout(() => keyEl.classList.remove(cls), 400);
  }
}

function clearKeyboardHighlights() {
  dom.keyboardVisual.querySelectorAll(".kb-key").forEach(k => {
    k.classList.remove("active", "correct", "wrong");
  });
}
