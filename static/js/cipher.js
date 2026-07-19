/* ==========================================================
   KidCoder – Cipher Module (tajne szyfry)
   Dziecko odszyfrowuje słowo za pomocą klucza symboli.
   ========================================================== */

// ============ CIPHER LIST ============
function renderCipherList() {
  if (!dom.cipherGrid) return;
  dom.cipherGrid.innerHTML = "";
  (state.cipherPuzzles || []).forEach(puzzle => {
    const completed = (state.progress.cipher_completed || []).includes(puzzle.id);
    const stars = (state.progress.cipher_stars || {})[String(puzzle.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${puzzle.id}</div>
      <h3>${esc(puzzle.title)}</h3>
      <p>${esc(puzzle.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadCipherPuzzle(puzzle.id));
    dom.cipherGrid.appendChild(card);
  });
}

// ============ LOAD PUZZLE ============
async function loadCipherPuzzle(puzzleId) {
  try {
    const res = await fetch(`${API}/api/cipher/${puzzleId}`);
    state.currentCipher = await res.json();
  } catch { return; }

  const c = state.currentCipher;
  state.cipherSolved = false;
  state.cipherAttempts = 0;
  state.cipherHintIndex = 0;
  state.cipherSlots = c.word.split("").map(() => null);   // index tile-a lub null

  // Pula kafelków: litery słowa + litery-pułapki, wymieszane
  const pool = [...c.word.split(""), ...(c.decoys || [])];
  state.cipherTiles = pool
    .map(letter => ({ letter, used: false }))
    .sort(() => Math.random() - 0.5);

  dom.cipherTitle.textContent = c.title;
  dom.cipherStory.textContent = c.story || "";
  dom.cipherFeedback.textContent = "";
  dom.cipherFeedback.className = "logic-feedback";

  renderCipherKey();
  renderCipherMessage();
  renderCipherTiles();
  showScreen("cipher");
}

// ============ KEY TABLE ============
function renderCipherKey() {
  const c = state.currentCipher;
  dom.cipherKey.innerHTML = '<div class="cipher-key-title">🗝️ Klucz szyfru</div>';
  const wrap = document.createElement("div");
  wrap.className = "cipher-key-items";
  Object.entries(c.key)
    .sort(() => Math.random() - 0.5)
    .forEach(([letter, symbol]) => {
      const item = document.createElement("div");
      item.className = "cipher-key-item";
      item.innerHTML = `<span class="cipher-key-symbol">${symbol}</span><span class="cipher-key-letter">${esc(letter)}</span>`;
      wrap.appendChild(item);
    });
  dom.cipherKey.appendChild(wrap);
}

// ============ ENCRYPTED MESSAGE ============
function renderCipherMessage() {
  const c = state.currentCipher;
  dom.cipherMessage.innerHTML = "";
  c.word.split("").forEach((letter, i) => {
    const col = document.createElement("div");
    col.className = "cipher-char";
    const tileIdx = state.cipherSlots[i];
    const filled = tileIdx !== null ? state.cipherTiles[tileIdx].letter : "";
    col.innerHTML = `
      <div class="cipher-symbol">${c.key[letter]}</div>
      <button class="cipher-slot${filled ? " filled" : ""}" data-slot="${i}">${esc(filled)}</button>
    `;
    col.querySelector(".cipher-slot").addEventListener("click", () => clearCipherSlot(i));
    dom.cipherMessage.appendChild(col);
  });
}

// ============ LETTER TILES ============
function renderCipherTiles() {
  dom.cipherTiles.innerHTML = "";
  state.cipherTiles.forEach((tile, idx) => {
    const btn = document.createElement("button");
    btn.className = "cipher-tile" + (tile.used ? " used" : "");
    btn.textContent = tile.letter;
    btn.disabled = tile.used || state.cipherSolved;
    btn.addEventListener("click", () => placeCipherTile(idx));
    dom.cipherTiles.appendChild(btn);
  });
}

function placeCipherTile(tileIdx) {
  if (state.cipherSolved || state.cipherTiles[tileIdx].used) return;
  const slot = state.cipherSlots.indexOf(null);
  if (slot === -1) return;

  state.cipherSlots[slot] = tileIdx;
  state.cipherTiles[tileIdx].used = true;
  if (typeof Fun !== "undefined") Fun.sound("flip");
  renderCipherMessage();
  renderCipherTiles();

  if (!state.cipherSlots.includes(null)) checkCipherAnswer();
}

function clearCipherSlot(slotIdx) {
  if (state.cipherSolved) return;
  const tileIdx = state.cipherSlots[slotIdx];
  if (tileIdx === null) return;
  state.cipherSlots[slotIdx] = null;
  state.cipherTiles[tileIdx].used = false;
  renderCipherMessage();
  renderCipherTiles();
}

// ============ CHECK ============
function checkCipherAnswer() {
  const c = state.currentCipher;
  const guess = state.cipherSlots.map(i => state.cipherTiles[i].letter).join("");
  state.cipherAttempts++;

  if (guess === c.word) {
    state.cipherSolved = true;
    dom.cipherFeedback.textContent = "✅ Wiadomość odszyfrowana!";
    dom.cipherFeedback.className = "logic-feedback correct";

    let stars = 3;
    if (state.cipherAttempts === 2) stars = 2;
    if (state.cipherAttempts > 2) stars = 1;
    setTimeout(() => onCipherComplete(stars), 700);
  } else {
    dom.cipherFeedback.textContent = "❌ To nie to słowo. Spójrz na klucz i spróbuj jeszcze raz!";
    dom.cipherFeedback.className = "logic-feedback wrong";
    dom.cipherMessage.classList.add("cipher-shake");
    setTimeout(() => {
      dom.cipherMessage.classList.remove("cipher-shake");
      state.cipherSlots = state.cipherSlots.map(() => null);
      state.cipherTiles.forEach(t => { t.used = false; });
      renderCipherMessage();
      renderCipherTiles();
      dom.cipherFeedback.textContent = "";
      dom.cipherFeedback.className = "logic-feedback";
    }, 1400);
  }
}

// ============ COMPLETE ============
function onCipherComplete(stars) {
  saveCipherProgress(state.currentCipher.id, stars);

  dom.cipherModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Szyfr złamany! Trenuj dalej, agencie! 🕵️",
    "Świetna robota, agencie! Prawie za pierwszym razem! 🎖️",
    "PERFEKCYJNIE! Jesteś super-agentem szyfrów! 🕵️‍♂️",
  ];
  dom.cipherModalMessage.textContent = messages[stars - 1] || messages[2];
  showModal("cipher-success");
}

function onNextCipher() {
  hideModal("cipher-success");
  const nextId = state.currentCipher.id + 1;
  const exists = (state.cipherPuzzles || []).find(p => p.id === nextId);
  if (exists) {
    loadCipherPuzzle(nextId);
  } else {
    showScreen("levels");
    renderCipherList();
  }
}

function onCipherHint() {
  const hints = (state.currentCipher && state.currentCipher.hints) || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Porównuj symbole z kluczem, litera po literze.";
  } else {
    dom.hintText.textContent = hints[state.cipherHintIndex % hints.length];
    state.cipherHintIndex++;
  }
  showModal("hint");
}

async function saveCipherProgress(puzzleId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cipher_id: puzzleId, cipher_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
