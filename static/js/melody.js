/* ==========================================================
   KidCoder – Melody Module (powtórz melodię, styl "Simon")
   Sekwencja kolorów-dźwięków do wysłuchania i powtórzenia.
   ========================================================== */

const MELODY_PADS = [
  { color: "#2ED573", freq: 262, name: "zielony" },
  { color: "#FD79A8", freq: 330, name: "różowy" },
  { color: "#54A0FF", freq: 392, name: "niebieski" },
  { color: "#FFD93D", freq: 523, name: "żółty" },
];

// ============ MELODY LIST ============
function renderMelodyList() {
  if (!dom.melodyGrid) return;
  dom.melodyGrid.innerHTML = "";
  (state.melodyGames || []).forEach(game => {
    const completed = (state.progress.melody_completed || []).includes(game.id);
    const stars = (state.progress.melody_stars || {})[String(game.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${game.id}</div>
      <h3>${esc(game.title)}</h3>
      <p>${esc(game.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadMelodyGame(game.id));
    dom.melodyGrid.appendChild(card);
  });
}

// ============ LOAD GAME ============
async function loadMelodyGame(gameId) {
  try {
    const res = await fetch(`${API}/api/melody/${gameId}`);
    state.currentMelody = await res.json();
  } catch { return; }

  const g = state.currentMelody;
  state.melodySolved = false;
  state.melodyMistakes = 0;
  state.melodyHintIndex = 0;
  state.melodyPlaying = false;
  state.melodyInputPos = 0;
  state.melodySequence = Array.from({ length: g.length }, () => Math.floor(Math.random() * g.pads));

  dom.melodyTitle.textContent = g.title;
  dom.melodyStatus.textContent = "Naciśnij ▶, żeby posłuchać melodii!";
  dom.melodyFeedback.textContent = "";
  dom.melodyFeedback.className = "logic-feedback";

  renderMelodyPads();
  renderMelodyProgress();
  showScreen("melody");
}

// ============ PADS ============
function renderMelodyPads() {
  const g = state.currentMelody;
  dom.melodyPads.innerHTML = "";
  for (let i = 0; i < g.pads; i++) {
    const pad = document.createElement("button");
    pad.className = "melody-pad";
    pad.style.background = MELODY_PADS[i].color;
    pad.dataset.pad = i;
    pad.setAttribute("aria-label", MELODY_PADS[i].name);
    pad.addEventListener("click", () => onMelodyPadClick(i));
    dom.melodyPads.appendChild(pad);
  }
  dom.melodyPads.classList.toggle("pads-4", g.pads === 4);
}

function renderMelodyProgress() {
  const g = state.currentMelody;
  dom.melodyProgress.innerHTML = "";
  for (let i = 0; i < g.length; i++) {
    const dot = document.createElement("span");
    dot.className = "melody-progress-dot" + (i < state.melodyInputPos ? " done" : "");
    dom.melodyProgress.appendChild(dot);
  }
}

function flashMelodyPad(i, dur) {
  const pad = dom.melodyPads.querySelector(`[data-pad="${i}"]`);
  if (!pad) return;
  pad.classList.add("lit");
  if (typeof Fun !== "undefined") Fun.note(MELODY_PADS[i].freq, Math.min(0.4, dur / 1200));
  setTimeout(() => pad.classList.remove("lit"), dur * 0.6);
}

// ============ PLAYBACK ============
async function playMelodySequence() {
  if (state.melodyPlaying || state.melodySolved) return;
  const g = state.currentMelody;
  state.melodyPlaying = true;
  state.melodyInputPos = 0;
  renderMelodyProgress();
  dom.melodyStatus.textContent = "🎧 Słuchaj uważnie…";

  await sleep(500);
  for (const padIdx of state.melodySequence) {
    flashMelodyPad(padIdx, g.speed);
    await sleep(g.speed);
  }
  state.melodyPlaying = false;
  dom.melodyStatus.textContent = "🎹 Twoja kolej! Powtórz melodię.";
}

// ============ INPUT ============
function onMelodyPadClick(i) {
  if (state.melodyPlaying || state.melodySolved) return;
  const g = state.currentMelody;
  flashMelodyPad(i, 350);

  if (i === state.melodySequence[state.melodyInputPos]) {
    state.melodyInputPos++;
    renderMelodyProgress();
    if (state.melodyInputPos === g.length) {
      state.melodySolved = true;
      dom.melodyStatus.textContent = "🎉 Cała melodia powtórzona!";
      let stars = 3;
      if (state.melodyMistakes >= 1) stars = 2;
      if (state.melodyMistakes > 2) stars = 1;
      setTimeout(() => onMelodyComplete(stars), 700);
    }
  } else {
    state.melodyMistakes++;
    state.melodyInputPos = 0;
    renderMelodyProgress();
    if (typeof Fun !== "undefined") Fun.sound("wrong");
    dom.melodyStatus.textContent = "❌ Ups, nie ten dźwięk! Posłuchaj jeszcze raz…";
    setTimeout(playMelodySequence, 1000);
  }
}

// ============ COMPLETE ============
function onMelodyComplete(stars) {
  saveMelodyProgress(state.currentMelody.id, stars);

  dom.melodyModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Melodia powtórzona! Ćwicz dalej swoje muzyczne ucho 🎶",
    "Prawie bezbłędnie! Pięknie słuchasz! 🎧",
    "PERFEKCYJNIE za pierwszym razem! Jesteś mistrzem melodii! 🎼",
  ];
  dom.melodyModalMessage.textContent = messages[stars - 1] || messages[2];
  showModal("melody-success");
}

function onNextMelody() {
  hideModal("melody-success");
  const nextId = state.currentMelody.id + 1;
  const exists = (state.melodyGames || []).find(g => g.id === nextId);
  if (exists) {
    loadMelodyGame(nextId);
  } else {
    showScreen("levels");
    renderMelodyList();
  }
}

function onMelodyHint() {
  const hints = (state.currentMelody && state.currentMelody.hints) || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Możesz słuchać melodii ile razy chcesz – naciśnij ▶.";
  } else {
    dom.hintText.textContent = hints[state.melodyHintIndex % hints.length];
    state.melodyHintIndex++;
  }
  showModal("hint");
}

async function saveMelodyProgress(gameId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ melody_id: gameId, melody_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
