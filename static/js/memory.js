/* ==========================================================
   KidCoder – Memory Card Matching Game Module
   Kids match emoji cards with programming concept cards.
   ========================================================== */

function renderMemoryList() {
  if (!dom.memoryGrid) return;
  const games = state.memoryGames;
  const p = state.progress;
  dom.memoryGrid.innerHTML = "";

  const colors = ["#6C5CE7", "#00B894", "#E17055", "#0984E3", "#FD79A8", "#FDCB6E", "#00CEC9", "#D63031", "#A29BFE", "#636E72"];

  games.forEach((g, i) => {
    const done = (p.memory_completed || []).includes(g.id);
    const stars = (p.memory_stars || {})[String(g.id)] || 0;
    const color = colors[i % colors.length];
    const pairCount = g.pairs ? g.pairs.length : 0;
    const previewEmojis = g.pairs ? g.pairs.slice(0, 4).map(p => p.emoji).join(" ") : "";

    const card = document.createElement("div");
    card.className = "memory-level-card" + (done ? " completed" : "");
    card.innerHTML = `
      <div class="mlc-accent" style="background:${color}"></div>
      <div class="mlc-body">
        <div class="mlc-header">
          <span class="mlc-number" style="background:${color}">${i + 1}</span>
          <span class="mlc-stars">${done ? starStr(stars, 3) : "☆☆☆"}</span>
        </div>
        <div class="mlc-preview">${esc(previewEmojis)}</div>
        <div class="mlc-title">${esc(g.title)}</div>
        <div class="mlc-info">
          <span class="mlc-badge">${pairCount} par</span>
          ${done ? '<span class="mlc-done">✅ Ukończone</span>' : ''}
        </div>
      </div>
    `;
    card.addEventListener("click", () => loadMemoryGame(g.id));
    dom.memoryGrid.appendChild(card);
  });
}

async function loadMemoryGame(id) {
  try {
    const res = await fetch(`${API}/api/memory/${id}`);
    if (!res.ok) throw new Error("fetch");
    state.currentMemory = await res.json();
  } catch {
    const g = state.memoryGames.find(g => g.id === id);
    if (g) state.currentMemory = g;
    else return;
  }

  state.memoryCards = [];
  state.memoryFlipped = [];
  state.memoryMatched = [];
  state.memoryMoves = 0;
  state.memoryLocked = false;
  state.memoryStartTime = null;
  state.memoryTimerInterval = null;
  state.memoryTimeLeft = state.currentMemory.time_limit || 90;
  state.memoryFinished = false;

  dom.memoryTitle.textContent = "🃏 " + state.currentMemory.title;
  dom.memoryMoves.textContent = "🎯 0 ruchów";
  dom.memoryTimer.textContent = "⏱ " + state.memoryTimeLeft + "s";

  buildMemoryCards();
  renderMemoryBoard();
  showScreen("memory");
}

function buildMemoryCards() {
  const pairs = state.currentMemory.pairs;
  const cards = [];
  pairs.forEach((pair, idx) => {
    cards.push({ id: idx * 2,     pairId: idx, type: "emoji", content: pair.emoji, label: pair.name, matched: false });
    cards.push({ id: idx * 2 + 1, pairId: idx, type: "emoji", content: pair.emoji, label: pair.name, matched: false });
  });
  // Shuffle using Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  state.memoryCards = cards;
}

function renderMemoryBoard() {
  if (!dom.memoryBoard) return;
  dom.memoryBoard.innerHTML = "";

  const count = state.memoryCards.length;
  const w = window.innerWidth;
  const cols = w <= 400 ? 2 : w <= 600 ? 3 : w <= 900 ? (count <= 6 ? 3 : 4) : (count <= 6 ? 3 : count <= 12 ? 4 : 5);
  dom.memoryBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  state.memoryCards.forEach((card, i) => {
    const cardEl = document.createElement("div");
    cardEl.className = "memory-card" + (card.matched ? " matched" : "");
    cardEl.dataset.index = i;

    const isFlipped = state.memoryFlipped.includes(i) || card.matched;
    const labelHtml = card.matched && card.label ? `<span class="memory-card-label">${esc(card.label)}</span>` : "";

    if (isFlipped) {
      cardEl.classList.add("flipped");
      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">
            <span class="memory-card-icon">🃏</span>
          </div>
          <div class="memory-card-back emoji">
            <span class="memory-card-content">${esc(card.content)}</span>
            ${labelHtml}
          </div>
        </div>
      `;
    } else {
      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">
            <span class="memory-card-icon">🃏</span>
          </div>
          <div class="memory-card-back emoji">
            <span class="memory-card-content">${esc(card.content)}</span>
          </div>
        </div>
      `;
    }

    if (!card.matched) {
      cardEl.addEventListener("click", () => onMemoryCardClick(i));
    }

    dom.memoryBoard.appendChild(cardEl);
  });
}

function onMemoryCardClick(index) {
  if (state.memoryLocked || state.memoryFinished) return;
  if (state.memoryFlipped.includes(index)) return;
  if (state.memoryCards[index].matched) return;

  // Start timer on first click
  if (!state.memoryStartTime) {
    state.memoryStartTime = Date.now();
    startMemoryTimer();
  }

  state.memoryFlipped.push(index);

  // Animate flip
  const cards = dom.memoryBoard.querySelectorAll(".memory-card");
  if (cards[index]) cards[index].classList.add("flipped");

  if (state.memoryFlipped.length === 2) {
    state.memoryMoves++;
    dom.memoryMoves.textContent = "🎯 " + state.memoryMoves + " ruchów";

    const [first, second] = state.memoryFlipped;
    const card1 = state.memoryCards[first];
    const card2 = state.memoryCards[second];

    if (card1.pairId === card2.pairId) {
      // Match!
      card1.matched = true;
      card2.matched = true;
      state.memoryMatched.push(card1.pairId);
      state.memoryFlipped = [];

      setTimeout(() => {
        if (cards[first]) cards[first].classList.add("matched");
        if (cards[second]) cards[second].classList.add("matched");

        // Check win
        if (state.memoryMatched.length === state.currentMemory.pairs.length) {
          onMemoryWin();
        }
      }, 300);
    } else {
      // No match – flip back
      state.memoryLocked = true;
      setTimeout(() => {
        if (cards[first]) cards[first].classList.remove("flipped");
        if (cards[second]) cards[second].classList.remove("flipped");
        state.memoryFlipped = [];
        state.memoryLocked = false;
      }, 800);
    }
  }
}

function startMemoryTimer() {
  if (state.memoryTimerInterval) clearInterval(state.memoryTimerInterval);
  state.memoryTimerInterval = setInterval(() => {
    state.memoryTimeLeft--;
    dom.memoryTimer.textContent = "⏱ " + Math.max(0, state.memoryTimeLeft) + "s";
    if (state.memoryTimeLeft <= 10) {
      dom.memoryTimer.style.color = "#D63031";
    }
    if (state.memoryTimeLeft <= 0) {
      clearInterval(state.memoryTimerInterval);
      onMemoryTimeout();
    }
  }, 1000);
}

function stopMemoryTimer() {
  if (state.memoryTimerInterval) {
    clearInterval(state.memoryTimerInterval);
    state.memoryTimerInterval = null;
  }
}

function onMemoryWin() {
  state.memoryFinished = true;
  stopMemoryTimer();

  const pairs = state.currentMemory.pairs.length;
  const perfectMoves = pairs; // minimum possible moves
  const ratio = state.memoryMoves / perfectMoves;
  let stars = 3;
  if (ratio > 2.5) stars = 1;
  else if (ratio > 1.5) stars = 2;

  setTimeout(() => showMemoryResult(stars, true), 400);
}

function onMemoryTimeout() {
  state.memoryFinished = true;
  state.memoryLocked = true;

  const matched = state.memoryMatched.length;
  const total = state.currentMemory.pairs.length;

  if (matched >= total * 0.5) {
    showMemoryResult(1, true);
  } else {
    showMemoryResult(0, false);
  }
}

async function showMemoryResult(stars, passed) {
  if (passed && stars >= 1) {
    await saveMemoryProgress(state.currentMemory.id, stars);
  }

  dom.memoryResultStars.textContent = stars > 0 ? starStr(stars, 3) : "😢";
  dom.memoryResultTitle.textContent = passed ? "🎉 Brawo!" : "⏰ Czas minął!";
  dom.memoryResultMessage.textContent = passed
    ? (stars === 3 ? "Perfekcyjna pamięć! 🏆" : stars === 2 ? "Bardzo dobrze! 👏" : "Udało się! 👍")
    : "Spróbuj jeszcze raz – dasz radę!";
  dom.memoryResultMoves.textContent = state.memoryMoves;

  const matched = state.memoryMatched.length;
  const total = state.currentMemory.pairs.length;
  dom.memoryResultPairs.textContent = matched + " / " + total;

  showModal("memory-result");
}

async function saveMemoryProgress(memoryId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_id: memoryId, memory_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Save memory failed", e); }
}

function onNextMemory() {
  hideModal("memory-result");
  const games = state.memoryGames;
  const idx = games.findIndex(g => g.id === state.currentMemory.id);
  if (idx >= 0 && idx < games.length - 1) {
    loadMemoryGame(games[idx + 1].id);
  } else {
    showScreen("levels");
    renderMemoryList();
  }
}

function resetMemoryGame() {
  stopMemoryTimer();
  if (state.currentMemory) {
    loadMemoryGame(state.currentMemory.id);
  }
}

function stopMemoryGame() {
  stopMemoryTimer();
  state.memoryFinished = true;
  state.memoryLocked = true;
}
