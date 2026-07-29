/* ==========================================================
   KidCoder – Binary Module (żarówki bitowe)
   Dziecko zapala żarówki o wartościach 1,2,4,8,16,
   aby ich suma dała zadaną liczbę.
   ========================================================== */

// ============ BINARY LIST ============
function renderBinaryList() {
  if (!dom.binaryGrid) return;
  dom.binaryGrid.innerHTML = "";
  (state.binaryPuzzles || []).forEach(puzzle => {
    const completed = (state.progress.binary_completed || []).includes(puzzle.id);
    const stars = (state.progress.binary_stars || {})[String(puzzle.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "");
    card.innerHTML = `
      <div class="level-number">${puzzle.id}</div>
      <h3>${esc(puzzle.title)}</h3>
      <p>${esc(puzzle.description)}</p>
      <p class="level-desc-mini">${puzzle.bits} żarówki</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    card.addEventListener("click", () => loadBinaryPuzzle(puzzle.id));
    dom.binaryGrid.appendChild(card);
  });
}

// ============ LOAD PUZZLE ============
async function loadBinaryPuzzle(puzzleId) {
  try {
    const res = await fetch(`${API}/api/binary/${puzzleId}`);
    state.currentBinary = await res.json();
  } catch { return; }

  const p = state.currentBinary;
  state.binarySolved = false;
  state.binaryAttempts = 0;
  state.binaryHintIndex = 0;
  state.binaryOn = Array(p.bits).fill(false);

  dom.binaryTitle.textContent = p.title;
  dom.binaryTarget.textContent = p.target;
  dom.binaryFeedback.textContent = "";
  dom.binaryFeedback.className = "logic-feedback";

  renderBinaryBulbs();
  showScreen("binary");
}

function binaryValues() {
  // np. bits=4 -> [8, 4, 2, 1]
  const p = state.currentBinary;
  return Array.from({ length: p.bits }, (_, i) => 2 ** (p.bits - 1 - i));
}

function binarySum() {
  return binaryValues().reduce((sum, v, i) => sum + (state.binaryOn[i] ? v : 0), 0);
}

// ============ BULBS ============
function renderBinaryBulbs() {
  dom.binaryBulbs.innerHTML = "";
  binaryValues().forEach((value, i) => {
    const bulb = document.createElement("button");
    bulb.className = "binary-bulb" + (state.binaryOn[i] ? " on" : "");
    const dots = Array.from({ length: value }, () => '<span class="binary-dot"></span>').join("");
    bulb.innerHTML = `
      <span class="binary-bulb-icon">${state.binaryOn[i] ? "💡" : "⚫"}</span>
      <span class="binary-bulb-value">${value}</span>
      <span class="binary-dots">${dots}</span>
    `;
    bulb.addEventListener("click", () => toggleBinaryBulb(i));
    dom.binaryBulbs.appendChild(bulb);
  });
  updateBinarySum();
}

function toggleBinaryBulb(i) {
  if (state.binarySolved) return;
  state.binaryOn[i] = !state.binaryOn[i];
  if (typeof Fun !== "undefined") Fun.sound(state.binaryOn[i] ? "pop" : "flip");
  renderBinaryBulbs();
}

function updateBinarySum() {
  const sum = binarySum();
  dom.binarySum.textContent = sum;
  dom.binarySum.classList.toggle("match", sum === state.currentBinary.target);
}

// ============ CHECK ============
function checkBinary() {
  if (state.binarySolved) return;
  state.binaryAttempts++;
  const p = state.currentBinary;
  const sum = binarySum();

  if (sum === p.target) {
    state.binarySolved = true;
    dom.binaryFeedback.textContent = "✅ Dokładnie tyle! Świetnie liczysz bitami!";
    dom.binaryFeedback.className = "logic-feedback correct";

    let stars = 3;
    if (state.binaryAttempts === 2) stars = 2;
    if (state.binaryAttempts > 2) stars = 1;
    setTimeout(() => onBinaryComplete(stars), 700);
  } else {
    const diff = sum < p.target ? "Za mało kropek – zapal coś jeszcze!" : "Za dużo kropek – zgaś którąś żarówkę!";
    dom.binaryFeedback.textContent = `❌ Masz ${sum}, a potrzeba ${p.target}. ${diff}`;
    dom.binaryFeedback.className = "logic-feedback wrong";
    dom.binaryBulbs.classList.add("cipher-shake");
    setTimeout(() => dom.binaryBulbs.classList.remove("cipher-shake"), 500);
  }
}

// ============ COMPLETE ============
function onBinaryComplete(stars) {
  saveBinaryProgress(state.currentBinary.id, stars);

  dom.binaryModalStars.textContent = starStr(stars, 3);
  const messages = [
    "Liczba zbudowana! Bity Cię polubiły 💡",
    "Prawie perfekcyjnie! Bity słuchają Cię coraz lepiej! ⚡",
    "PERFEKCYJNIE! Liczysz jak prawdziwy komputer! 🖥️",
  ];
  dom.binaryModalMessage.textContent = messages[stars - 1] || messages[2];
  showModal("binary-success");
}

function onNextBinary() {
  hideModal("binary-success");
  const nextId = state.currentBinary.id + 1;
  const exists = (state.binaryPuzzles || []).find(p => p.id === nextId);
  if (exists) {
    loadBinaryPuzzle(nextId);
  } else {
    showScreen("levels");
    renderBinaryList();
  }
}

function onBinaryHint() {
  const hints = (state.currentBinary && state.currentBinary.hints) || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Zacznij od największej żarówki, która mieści się w liczbie.";
  } else {
    dom.hintText.textContent = hints[state.binaryHintIndex % hints.length];
    state.binaryHintIndex++;
  }
  showModal("hint");
}

async function saveBinaryProgress(puzzleId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binary_id: puzzleId, binary_stars: stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Zapis nie powiódł się", e); }
}
