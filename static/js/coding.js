/* ==========================================================
   KidCoder – Coding Game Module
   ========================================================== */

// ============ LEVEL SELECT ============
function renderLevels() {
  dom.levelsGrid.innerHTML = "";
  state.levels.forEach(lv => {
    const completed = state.progress.completed.includes(lv.id);
    const locked = lv.id > (state.progress.current_level || 1);
    const stars = state.progress.stars?.[String(lv.id)] || 0;

    const card = document.createElement("div");
    card.className = "level-card" + (completed ? " completed" : "") + (locked ? " locked" : "");
    card.innerHTML = `
      <div class="level-number">${lv.id}</div>
      <h3>${esc(lv.title)}</h3>
      <p>${esc(lv.description)}</p>
      <div class="level-stars">${starStr(stars, 3)}</div>
    `;
    if (!locked) card.addEventListener("click", () => loadLevel(lv.id));
    dom.levelsGrid.appendChild(card);
  });
}

// ============ LOAD LEVEL ============
async function loadLevel(levelId) {
  try {
    const res = await fetch(`${API}/api/levels/${levelId}`);
    state.currentLevel = await res.json();
  } catch { return; }

  state.program = [];
  state.hintIndex = 0;
  state.executing = false;
  state.stepIndex = 0;

  dom.levelTitle.textContent = `Poziom ${state.currentLevel.id}: ${state.currentLevel.title}`;
  dom.levelDesc.textContent = state.currentLevel.description;
  dom.gameMessage.textContent = "";
  dom.gameMessage.className = "game-message";

  renderToolbox();
  renderProgram();
  resetGameState();
  renderGame();
  showScreen("game");
}

// ============ TOOLBOX ============
function renderToolbox() {
  dom.toolbox.innerHTML = "";
  const blocks = state.currentLevel.available_blocks;
  blocks.forEach((type, idx) => {
    const def = BLOCK_DEFS[type];
    if (!def) return;
    const el = createBlockElement(type, "toolbox-" + idx);
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ type, source: "toolbox", idx }));
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => el.classList.remove("dragging"));
    el.addEventListener("click", () => addBlockToProgram(type));
    dom.toolbox.appendChild(el);
  });
}

function createBlockElement(type, id) {
  const def = BLOCK_DEFS[type];
  const el = document.createElement("div");
  el.className = `block block-${type}`;
  el.dataset.blockId = id;
  el.dataset.blockType = type;

  const iconWrap = document.createElement("span");
  iconWrap.className = "block-icon";
  iconWrap.innerHTML = blockIconSVG(def.icon);

  const labelEl = document.createElement("span");
  labelEl.textContent = def.label;

  el.appendChild(iconWrap);
  el.appendChild(labelEl);

  if (def.container) {
    const body = document.createElement("div");
    body.className = "block-body";
    body.dataset.container = "true";
    body.addEventListener("dragover", e => { e.preventDefault(); e.stopPropagation(); });
    body.addEventListener("drop", e => {
      e.preventDefault(); e.stopPropagation();
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.source === "program") return;
      addBlockToContainer(el.dataset.programIdx, data.type);
    });
    body.addEventListener("click", e => e.stopPropagation());
    el.appendChild(body);
  }

  return el;
}

// ============ PROGRAM AREA ============
let blockCounter = 0;

function addBlockToProgram(type) {
  if (state.executing) return;
  const def = BLOCK_DEFS[type];
  if (!def) return;
  const block = { id: blockCounter++, type, children: def.container ? [] : undefined };
  state.program.push(block);
  removeFromToolbox(type);
  renderProgram();
  renderToolbox();
}

function addBlockToContainer(parentIdx, type) {
  if (state.executing) return;
  const parent = state.program[parseInt(parentIdx)];
  if (!parent || !parent.children) return;
  const def = BLOCK_DEFS[type];
  if (!def) return;
  parent.children.push({ id: blockCounter++, type, children: def.container ? [] : undefined });
  removeFromToolbox(type);
  renderProgram();
  renderToolbox();
}

function removeFromToolbox(type) {
  const blocks = state.currentLevel.available_blocks;
  const idx = blocks.indexOf(type);
  if (idx !== -1) blocks.splice(idx, 1);
}

function returnToToolbox(type) {
  state.currentLevel.available_blocks.push(type);
}

function removeBlock(blockId) {
  for (let i = state.program.length - 1; i >= 0; i--) {
    if (state.program[i].id === blockId) {
      returnAllBlocks(state.program[i]);
      state.program.splice(i, 1);
      renderProgram();
      renderToolbox();
      return;
    }
    if (state.program[i].children) {
      for (let j = state.program[i].children.length - 1; j >= 0; j--) {
        if (state.program[i].children[j].id === blockId) {
          returnToToolbox(state.program[i].children[j].type);
          state.program[i].children.splice(j, 1);
          renderProgram();
          renderToolbox();
          return;
        }
      }
    }
  }
}

function returnAllBlocks(block) {
  returnToToolbox(block.type);
  if (block.children) block.children.forEach(c => returnAllBlocks(c));
}

function onDropProgram(e) {
  e.preventDefault();
  dom.programArea.classList.remove("drag-over");
  try {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.source === "program") return;
    addBlockToProgram(data.type);
  } catch {}
}

function renderProgram() {
  dom.programArea.innerHTML = "";
  if (state.program.length === 0) {
    dom.programArea.innerHTML = '<div class="drop-placeholder">Przeciągnij bloki tutaj!</div>';
    return;
  }
  state.program.forEach((block, idx) => {
    const el = createProgramBlock(block, idx);
    dom.programArea.appendChild(el);
  });
}

function createProgramBlock(block, parentIdx) {
  const def = BLOCK_DEFS[block.type];
  const el = createBlockElement(block.type, "prog-" + block.id);
  el.dataset.programIdx = parentIdx;

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.textContent = "×";
  removeBtn.addEventListener("click", e => { e.stopPropagation(); removeBlock(block.id); });
  el.appendChild(removeBtn);

  el.setAttribute("draggable", "true");
  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: block.type, source: "program", id: block.id }));
    el.classList.add("dragging");
  });

  if (block.children && def.container) {
    const body = el.querySelector(".block-body");
    if (body) {
      block.children.forEach(child => {
        const childEl = createBlockElement(child.type, "prog-" + child.id);
        const childRemove = document.createElement("button");
        childRemove.className = "btn-remove";
        childRemove.textContent = "×";
        childRemove.addEventListener("click", e => { e.stopPropagation(); removeBlock(child.id); });
        childEl.appendChild(childRemove);
        body.appendChild(childEl);
      });
      if (block.children.length === 0) {
        const hint = document.createElement("div");
        hint.className = "drop-placeholder";
        hint.textContent = "Upuść bloki tutaj";
        hint.style.fontSize = "0.72rem";
        hint.style.padding = "6px";
        body.appendChild(hint);
      }
    }
  }

  return el;
}

// ============ GAME RENDERING (SVG) ============
function resetGameState() {
  const lv = state.currentLevel;
  state.heroX = lv.hero_start[0];
  state.heroY = lv.hero_start[1];
  state.heroDir = lv.hero_dir || "right";
  state.collectedGems = [];
  state.stepIndex = 0;
}

function renderGame() {
  const lv = state.currentLevel;
  const svg = dom.gameSvg;
  const gw = lv.grid_width;
  const gh = lv.grid_height;
  const padding = 20;
  const totalW = 500 - 2 * padding;
  const totalH = 500 - 2 * padding;
  const cellW = totalW / gw;
  const cellH = totalH / gh;
  svg.setAttribute("viewBox", `0 0 500 500`);

  let html = "";
  html += `<rect x="0" y="0" width="500" height="500" rx="16" fill="#F8F9FD"/>`;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const cx = padding + x * cellW;
      const cy = padding + y * cellH;
      const isWall = (lv.walls || []).some(w => w[0] === x && w[1] === y);
      const fill = isWall ? "#B2BEC3" : ((x + y) % 2 === 0 ? "#FFFFFF" : "#F0EDFF");
      html += `<rect x="${cx + 1}" y="${cy + 1}" width="${cellW - 2}" height="${cellH - 2}" rx="6" fill="${fill}"/>`;
      if (isWall) {
        html += `<rect x="${cx + 4}" y="${cy + 4}" width="${cellW - 8}" height="${cellH - 8}" rx="4" fill="#636E72" opacity="0.3"/>`;
      }
    }
  }

  const gx = padding + lv.goal[0] * cellW + cellW / 2;
  const gy = padding + lv.goal[1] * cellH + cellH / 2;
  const starSize = Math.min(cellW, cellH) * 0.35;
  html += drawStar(gx, gy, starSize, "#FDCB6E", "#F39C12");

  if (lv.gems) {
    lv.gems.forEach(([gemX, gemY]) => {
      if (!state.collectedGems.some(g => g[0] === gemX && g[1] === gemY)) {
        const gxp = padding + gemX * cellW + cellW / 2;
        const gyp = padding + gemY * cellH + cellH / 2;
        html += drawGem(gxp, gyp, Math.min(cellW, cellH) * 0.25);
      }
    });
  }

  const hx = padding + state.heroX * cellW + cellW / 2;
  const hy = padding + state.heroY * cellH + cellH / 2;
  const heroSize = Math.min(cellW, cellH) * 0.35;
  html += drawHero(hx, hy, heroSize, state.heroDir);

  svg.innerHTML = html;
}

function drawStar(cx, cy, size, fill, stroke) {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    const inner = (i * 72 + 36 - 90) * Math.PI / 180;
    points.push(`${cx + size * 0.45 * Math.cos(inner)},${cy + size * 0.45 * Math.sin(inner)}`);
  }
  return `<polygon points="${points.join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="2">
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="6s" repeatCount="indefinite"/>
  </polygon>`;
}

function drawGem(cx, cy, size) {
  return `<polygon points="${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}" fill="#55EFC4" stroke="#00B894" stroke-width="2">
    <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
  </polygon>`;
}

function drawHero(cx, cy, size, dir) {
  const angles = { right: 0, down: 90, left: 180, up: 270 };
  const angle = angles[dir] || 0;
  return `<g transform="translate(${cx},${cy}) rotate(${angle})">
    <circle r="${size}" fill="#6C5CE7" stroke="#5A4BD1" stroke-width="2"/>
    <polygon points="${size * 0.6},-${size * 0.25} ${size * 0.6},${size * 0.25} ${size * 0.95},0" fill="#FFEAA7"/>
    <circle cx="-${size * 0.2}" cy="-${size * 0.15}" r="${size * 0.15}" fill="#FFF"/>
    <circle cx="${size * 0.2}" cy="-${size * 0.15}" r="${size * 0.15}" fill="#FFF"/>
    <circle cx="-${size * 0.15}" cy="-${size * 0.15}" r="${size * 0.07}" fill="#2D3436"/>
    <circle cx="${size * 0.25}" cy="-${size * 0.15}" r="${size * 0.07}" fill="#2D3436"/>
    <path d="M-${size * 0.2},${size * 0.2} Q0,${size * 0.4} ${size * 0.2},${size * 0.2}" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
  </g>`;
}

// ============ EXECUTION ENGINE ============
function flattenProgram(program) {
  const instructions = [];
  let funcBody = [];
  for (const block of program) {
    if (block.type === "define_func" && block.children) {
      funcBody = block.children.map(c => c.type);
    }
  }

  for (const block of program) {
    if (block.type === "define_func") continue;
    const def = BLOCK_DEFS[block.type];

    if (block.type === "call_func") {
      funcBody.forEach(t => instructions.push(t));
    } else if (def && def.condition && def.container && block.children) {
      instructions.push({ type: block.type, children: block.children.map(c => c.type) });
    } else if (def && def.container && block.children) {
      const repeatCount = def.repeat || 1;
      for (let r = 0; r < repeatCount; r++) {
        for (const child of block.children) {
          if (child.type === "call_func") {
            funcBody.forEach(t => instructions.push(t));
          } else {
            instructions.push(child.type);
          }
        }
      }
    } else if (block.type === "if_wall") {
      instructions.push("if_wall");
    } else {
      instructions.push(block.type);
    }
  }
  return instructions;
}

async function onRun() {
  if (state.executing) return;
  state.executing = true;
  dom.btnRun.disabled = true;
  dom.gameMessage.textContent = "";
  dom.gameMessage.className = "game-message";
  resetGameState();
  renderGame();

  const instructions = flattenProgram(state.program);
  let success = true;

  for (let i = 0; i < instructions.length; i++) {
    const result = executeInstruction(instructions[i]);
    renderGame();
    highlightBlock(i);
    await sleep(400);

    if (result === "wall") {
      showMessage("🧱 Ups! Uderzenie w ścianę!", "error");
      success = false;
      break;
    }
    if (result === "out") {
      showMessage("🚫 Wyjście poza planszę!", "error");
      success = false;
      break;
    }

    if (state.heroX === state.currentLevel.goal[0] && state.heroY === state.currentLevel.goal[1]) {
      if (state.currentLevel.gems) {
        const allGems = state.currentLevel.gems.every(g =>
          state.collectedGems.some(c => c[0] === g[0] && c[1] === g[1])
        );
        if (!allGems) {
          showMessage("💎 Najpierw zbierz wszystkie klejnoty!", "error");
          success = false;
          break;
        }
      }
      const usedBlocks = instructions.length;
      let stars = 3;
      if (usedBlocks > (state.currentLevel.available_blocks?.length || 999) * 0.8) stars = 2;
      if (usedBlocks > (state.currentLevel.available_blocks?.length || 999)) stars = 1;

      await sleep(300);
      onLevelComplete(stars);
      state.executing = false;
      dom.btnRun.disabled = false;
      return;
    }
  }

  if (success && !(state.heroX === state.currentLevel.goal[0] && state.heroY === state.currentLevel.goal[1])) {
    showMessage("🤔 Nie dotarłeś do gwiazdki! Spróbuj ponownie.", "error");
  }

  state.executing = false;
  dom.btnRun.disabled = false;
}

async function onStep() {
  if (state.executing) return;
  const instructions = flattenProgram(state.program);
  if (state.stepIndex >= instructions.length) {
    showMessage("Brak kolejnych kroków!", "error");
    return;
  }
  if (state.stepIndex === 0) {
    resetGameState();
    renderGame();
  }

  const result = executeInstruction(instructions[state.stepIndex]);
  renderGame();
  highlightBlock(state.stepIndex);
  state.stepIndex++;

  if (result === "wall") { showMessage("🧱 Ups! Uderzenie w ścianę!", "error"); state.stepIndex = 0; return; }
  if (result === "out") { showMessage("🚫 Wyjście poza planszę!", "error"); state.stepIndex = 0; return; }

  if (state.heroX === state.currentLevel.goal[0] && state.heroY === state.currentLevel.goal[1]) {
    if (state.currentLevel.gems) {
      const allGems = state.currentLevel.gems.every(g =>
        state.collectedGems.some(c => c[0] === g[0] && c[1] === g[1])
      );
      if (!allGems) { showMessage("💎 Zbierz wszystkie klejnoty!", "error"); return; }
    }
    onLevelComplete(2);
    state.stepIndex = 0;
  }
}

function executeInstruction(instr) {
  const lv = state.currentLevel;
  const type = typeof instr === "string" ? instr : instr.type;

  if (type === "if_path_clear" && typeof instr === "object") {
    const [dx, dy] = DIR_DELTAS[state.heroDir];
    const nx = state.heroX + dx;
    const ny = state.heroY + dy;
    const clear = nx >= 0 && ny >= 0 && nx < lv.grid_width && ny < lv.grid_height &&
      !(lv.walls || []).some(w => w[0] === nx && w[1] === ny);
    if (clear && instr.children) {
      for (const child of instr.children) {
        const r = executeInstruction(child);
        if (r === "wall" || r === "out") return r;
      }
    }
    return "ok";
  }

  if (type === "if_wall_ahead" && typeof instr === "object") {
    const [dx, dy] = DIR_DELTAS[state.heroDir];
    const nx = state.heroX + dx;
    const ny = state.heroY + dy;
    const wallAhead = nx < 0 || ny < 0 || nx >= lv.grid_width || ny >= lv.grid_height ||
      (lv.walls || []).some(w => w[0] === nx && w[1] === ny);
    if (wallAhead && instr.children) {
      for (const child of instr.children) {
        const r = executeInstruction(child);
        if (r === "wall" || r === "out") return r;
      }
    }
    return "ok";
  }

  if (type === "forward") {
    const [dx, dy] = DIR_DELTAS[state.heroDir];
    const nx = state.heroX + dx;
    const ny = state.heroY + dy;
    if (nx < 0 || ny < 0 || nx >= lv.grid_width || ny >= lv.grid_height) return "out";
    if ((lv.walls || []).some(w => w[0] === nx && w[1] === ny)) return "wall";
    state.heroX = nx;
    state.heroY = ny;
    return "ok";
  }

  if (type === "turn_right") {
    const idx = DIR_ORDER.indexOf(state.heroDir);
    state.heroDir = DIR_ORDER[(idx + 1) % 4];
    return "ok";
  }

  if (type === "turn_left") {
    const idx = DIR_ORDER.indexOf(state.heroDir);
    state.heroDir = DIR_ORDER[(idx + 3) % 4];
    return "ok";
  }

  if (type === "collect") {
    if (lv.gems) {
      const gem = lv.gems.find(g => g[0] === state.heroX && g[1] === state.heroY);
      if (gem && !state.collectedGems.some(c => c[0] === gem[0] && c[1] === gem[1])) {
        state.collectedGems.push([gem[0], gem[1]]);
      }
    }
    return "ok";
  }

  if (type === "if_wall") {
    const [dx, dy] = DIR_DELTAS[state.heroDir];
    const nx = state.heroX + dx;
    const ny = state.heroY + dy;
    const wallAhead = nx < 0 || ny < 0 || nx >= lv.grid_width || ny >= lv.grid_height ||
      (lv.walls || []).some(w => w[0] === nx && w[1] === ny);
    if (wallAhead) {
      const idx = DIR_ORDER.indexOf(state.heroDir);
      state.heroDir = DIR_ORDER[(idx + 1) % 4];
    } else {
      state.heroX = nx;
      state.heroY = ny;
    }
    return "ok";
  }

  return "ok";
}

function highlightBlock(index) {
  $$(".block.executing").forEach(b => b.classList.remove("executing"));
  const blocks = dom.programArea.querySelectorAll(".block");
  if (blocks[index]) blocks[index].classList.add("executing");
}

function showMessage(text, type) {
  dom.gameMessage.textContent = text;
  dom.gameMessage.className = "game-message " + (type || "");
}

function stopExecution() {
  state.executing = false;
  dom.btnRun.disabled = false;
  if (state.animTimer) { clearTimeout(state.animTimer); state.animTimer = null; }
}

// ============ LEVEL COMPLETE ============
function onLevelComplete(stars) {
  saveProgress(state.currentLevel.id, stars);

  dom.modalStars.textContent = starStr(stars, 3);
  const messages = [
    "Dobry początek! Dasz radę lepiej? 🤔",
    "Świetna robota! Prawie perfekcyjnie! 🎊",
    "PERFEKCYJNIE! Jesteś geniuszem kodowania! 🏆",
  ];
  dom.modalMessage.textContent = messages[stars - 1] || messages[2];
  showModal("success");
}

function onNextLevel() {
  hideModal("success");
  const nextId = state.currentLevel.id + 1;
  const exists = state.levels.find(l => l.id === nextId);
  if (exists && nextId <= (state.progress.current_level || 1)) {
    loadLevel(nextId);
  } else if (exists) {
    loadLevel(nextId);
  } else {
    showScreen("levels");
    renderLevels();
  }
}

// ============ CONTROLS ============
function onClear() {
  if (state.executing) return;
  state.program.forEach(b => returnAllBlocks(b));
  state.program = [];
  renderProgram();
  renderToolbox();
}

function onResetLevel() {
  stopExecution();
  resetGameState();
  renderGame();
  dom.gameMessage.textContent = "";
  dom.gameMessage.className = "game-message";
  state.stepIndex = 0;
}

function onHint() {
  const hints = state.currentLevel.hints || [];
  if (hints.length === 0) {
    dom.hintText.textContent = "Brak podpowiedzi do tego poziomu. Dasz radę!";
  } else {
    dom.hintText.textContent = hints[state.hintIndex % hints.length];
    state.hintIndex++;
  }
  showModal("hint");
}
