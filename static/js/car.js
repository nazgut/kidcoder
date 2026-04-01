/* ==========================================================
   KidCoder – Car Driving Game Module
   ========================================================== */

const CAR_W = 500, CAR_H = 600;
const ROAD_LEFT = 100, ROAD_RIGHT = 400;
const LANE_W = (ROAD_RIGHT - ROAD_LEFT) / 3;
const CAR_Y = 500;

let carRoadOffset = 0;
let carEffects = [];
let carPlayerLane = 1;
let carShake = 0;

function startCarGame(lessonId, chars) {
  state.carActive = true;
  state.carScore = 0;
  state.carLives = 3;
  state.carCorrect = 0;
  state.carTotal = 0;
  state.carLetters = [];
  state.carLessonId = lessonId;
  state.carChars = chars;
  state.carLastSpawn = 0;
  carRoadOffset = 0;
  carEffects = [];
  carPlayerLane = 1;
  carShake = 0;

  dom.carTitle.textContent = `🏎️ Wyścig literek – Lekcja ${lessonId}`;
  dom.carScore.textContent = "🏆 0";
  dom.carLives.textContent = "❤️ 3";
  dom.carMessage.textContent = "";
  dom.carMessage.className = "game-message";

  showScreen("car");
  state.carAnimFrame = requestAnimationFrame(carGameLoop);
}

function stopCarGame() {
  state.carActive = false;
  if (state.carAnimFrame) {
    cancelAnimationFrame(state.carAnimFrame);
    state.carAnimFrame = null;
  }
}

let carLastTime = 0;
function carGameLoop(timestamp) {
  if (!state.carActive) return;
  const dt = carLastTime ? (timestamp - carLastTime) / 1000 : 0.016;
  carLastTime = timestamp;

  const speed = 120 + state.carScore * 3;
  carRoadOffset = (carRoadOffset + speed * dt) % 60;

  state.carLastSpawn = (state.carLastSpawn || 0) + dt;
  const spawnInterval = Math.max(0.8, 2 - state.carScore * 0.02);
  if (state.carLastSpawn >= spawnInterval) {
    state.carLastSpawn = 0;
    spawnCarLetter();
  }

  for (const letter of state.carLetters) {
    letter.y += speed * dt;
    letter.wobble = (letter.wobble || 0) + dt * 3;
  }

  carEffects = carEffects.filter(e => e.t > 0);
  for (const e of carEffects) { e.t -= dt; e.y -= 40 * dt; }

  if (carShake > 0) carShake = Math.max(0, carShake - dt * 15);

  const missed = state.carLetters.filter(l => l.y > CAR_Y + 40);
  missed.forEach(l => {
    state.carLives--;
    state.carTotal++;
    carShake = 4;
    carEffects.push({ type: "miss", x: l.x, y: CAR_Y, t: 0.7, text: "✗" });
  });
  state.carLetters = state.carLetters.filter(l => l.y <= CAR_Y + 40);
  dom.carLives.textContent = "❤️ " + Math.max(0, state.carLives);

  renderCarGame();

  if (state.carLives <= 0) {
    finishCarGame();
    return;
  }

  state.carAnimFrame = requestAnimationFrame(carGameLoop);
}

function spawnCarLetter() {
  const chars = state.carChars;
  const char = chars[Math.floor(Math.random() * chars.length)];
  const lanes = [ROAD_LEFT + LANE_W * 0.5, ROAD_LEFT + LANE_W * 1.5, ROAD_LEFT + LANE_W * 2.5];
  const x = lanes[Math.floor(Math.random() * 3)];
  state.carLetters.push({ char, x, y: -30 });
}

function onCarKeyDown(e) {
  if (!state.carActive) return;
  const key = e.key.toLowerCase();
  let bestIdx = -1;
  let bestY = -1;
  for (let i = 0; i < state.carLetters.length; i++) {
    if (state.carLetters[i].char === key && state.carLetters[i].y > bestY) {
      bestY = state.carLetters[i].y;
      bestIdx = i;
    }
  }
  if (bestIdx !== -1) {
    const hit = state.carLetters[bestIdx];
    carEffects.push({ type: "hit", x: hit.x, y: hit.y, t: 0.6, text: `+10` });
    state.carLetters.splice(bestIdx, 1);
    state.carScore += 10;
    state.carCorrect++;
    state.carTotal++;
    dom.carScore.textContent = "🏆 " + state.carScore;
  } else if (key.length === 1 && key.match(/[a-z]/)) {
    state.carTotal++;
    carShake = 2;
    carEffects.push({ type: "wrong", x: 250, y: CAR_Y - 40, t: 0.5, text: key.toUpperCase() + "?" });
  }
}

function renderCarGame() {
  const svg = dom.carSvg;
  const shX = carShake ? (Math.random() - 0.5) * carShake : 0;
  const shY = carShake ? (Math.random() - 0.5) * carShake : 0;
  let html = `<g transform="translate(${shX.toFixed(1)},${shY.toFixed(1)})">`;

  html += `<defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#74B9FF"/>
      <stop offset="100%" stop-color="#DFE6E9"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#636E72"/>
      <stop offset="10%" stop-color="#4A4E52"/>
      <stop offset="50%" stop-color="#555B5F"/>
      <stop offset="90%" stop-color="#4A4E52"/>
      <stop offset="100%" stop-color="#636E72"/>
    </linearGradient>
    <radialGradient id="signGlow">
      <stop offset="0%" stop-color="#FFEAA7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#FFEAA7" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>`;

  html += `<rect x="0" y="0" width="${CAR_W}" height="${CAR_H}" fill="url(#skyGrad)"/>`;

  html += `<rect x="0" y="0" width="${ROAD_LEFT}" height="${CAR_H}" fill="#55EFC4"/>`;
  html += `<rect x="${ROAD_RIGHT}" y="0" width="${CAR_W - ROAD_RIGHT}" height="${CAR_H}" fill="#55EFC4"/>`;
  for (let gy = -60 + (carRoadOffset * 0.3 % 40); gy < CAR_H; gy += 40) {
    html += `<line x1="10" y1="${gy}" x2="30" y2="${gy + 8}" stroke="#00D2A0" stroke-width="2" opacity="0.5"/>`;
    html += `<line x1="60" y1="${gy + 15}" x2="80" y2="${gy + 23}" stroke="#00D2A0" stroke-width="2" opacity="0.5"/>`;
    html += `<line x1="${ROAD_RIGHT + 20}" y1="${gy + 10}" x2="${ROAD_RIGHT + 40}" y2="${gy + 18}" stroke="#00D2A0" stroke-width="2" opacity="0.5"/>`;
    html += `<line x1="${ROAD_RIGHT + 60}" y1="${gy + 25}" x2="${ROAD_RIGHT + 80}" y2="${gy + 33}" stroke="#00D2A0" stroke-width="2" opacity="0.5"/>`;
  }

  const treePositions = [
    { x: 35, side: "left" }, { x: 65, side: "left" },
    { x: ROAD_RIGHT + 30, side: "right" }, { x: ROAD_RIGHT + 70, side: "right" },
  ];
  for (const tp of treePositions) {
    for (let ty = -80 + (carRoadOffset * 0.6 % 180); ty < CAR_H + 80; ty += 180) {
      html += `<g transform="translate(${tp.x},${ty})">
        <rect x="-4" y="10" width="8" height="20" rx="2" fill="#A0522D"/>
        <polygon points="0,-15 -16,12 16,12" fill="#00B894" opacity="0.9"/>
        <polygon points="0,-25 -12,0 12,0" fill="#00CEC9" opacity="0.8"/>
      </g>`;
    }
  }

  html += `<rect x="${ROAD_LEFT}" y="0" width="${ROAD_RIGHT - ROAD_LEFT}" height="${CAR_H}" fill="url(#roadGrad)"/>`;
  for (let cy = -60 + (carRoadOffset % 30); cy < CAR_H; cy += 30) {
    html += `<rect x="${ROAD_LEFT - 4}" y="${cy}" width="8" height="15" rx="1" fill="#E17055"/>`;
    html += `<rect x="${ROAD_LEFT - 4}" y="${cy + 15}" width="8" height="15" rx="1" fill="#FFF"/>`;
    html += `<rect x="${ROAD_RIGHT - 4}" y="${cy}" width="8" height="15" rx="1" fill="#E17055"/>`;
    html += `<rect x="${ROAD_RIGHT - 4}" y="${cy + 15}" width="8" height="15" rx="1" fill="#FFF"/>`;
  }
  for (let i = 1; i < 3; i++) {
    const lx = ROAD_LEFT + LANE_W * i;
    for (let y = -60 + carRoadOffset; y < CAR_H; y += 60) {
      html += `<rect x="${lx - 2}" y="${y}" width="4" height="30" fill="#FFEAA7" rx="2" opacity="0.7"/>`;
    }
  }

  if (state.carScore > 50) {
    const lineAlpha = Math.min(0.4, state.carScore * 0.002);
    for (let sl = 0; sl < 5; sl++) {
      const slx = ROAD_LEFT + 10 + (sl * 65) % (ROAD_RIGHT - ROAD_LEFT - 20);
      const sly = (carRoadOffset * 4 + sl * 137) % CAR_H;
      html += `<line x1="${slx}" y1="${sly}" x2="${slx}" y2="${sly + 40 + state.carScore * 0.3}" stroke="#FFF" stroke-width="1.5" opacity="${lineAlpha}"/>`;
    }
  }

  for (const letter of state.carLetters) {
    const wobbleX = Math.sin(letter.wobble || 0) * 3;
    const proximity = Math.max(0, 1 - Math.abs(letter.y - CAR_Y) / CAR_H);
    const scale = 0.7 + proximity * 0.35;
    html += `<g transform="translate(${letter.x + wobbleX},${letter.y}) scale(${scale.toFixed(2)})" filter="url(#shadow)">`;
    html += `<circle cx="0" cy="0" r="35" fill="url(#signGlow)"/>`;
    html += `<rect x="-3" y="20" width="6" height="22" fill="#B2BEC3" rx="2"/>`;
    html += `<rect x="-26" y="-26" width="52" height="52" rx="12" fill="#FFEAA7" stroke="#F39C12" stroke-width="2.5"/>`;
    html += `<rect x="-17" y="-17" width="34" height="34" rx="6" fill="none" stroke="#F39C12" stroke-width="1" opacity="0.3" transform="rotate(3)"/>`;
    html += `<text x="0" y="10" text-anchor="middle" fill="#2D3436" font-size="30" font-weight="800" font-family="Nunito">${letter.char.toUpperCase()}</text>`;
    html += `</g>`;
  }

  const carX = ROAD_LEFT + LANE_W * (carPlayerLane + 0.5);
  html += `<g transform="translate(${carX}, ${CAR_Y})" filter="url(#shadow)">`;
  if (state.carScore > 30) {
    for (let ei = 0; ei < 3; ei++) {
      const ey = 30 + ei * 8 + (carRoadOffset * 2 + ei * 40) % 20;
      const ea = 0.4 - ei * 0.12;
      html += `<circle cx="${-3 + ei * 3}" cy="${ey}" r="${3 + ei * 2}" fill="#B2BEC3" opacity="${ea}"/>`;
    }
  }
  html += `<rect x="-24" y="-40" width="48" height="68" rx="12" fill="#E17055"/>`;
  html += `<rect x="-20" y="-36" width="40" height="8" rx="4" fill="#E8604C" opacity="0.6"/>`;
  html += `<rect x="-17" y="-28" width="34" height="18" rx="5" fill="#74B9FF" opacity="0.85"/>`;
  html += `<rect x="-14" y="-26" width="12" height="14" rx="3" fill="#A5D8FF" opacity="0.4"/>`;
  html += `<rect x="-18" y="-8" width="36" height="14" rx="4" fill="#D63031"/>`;
  html += `<rect x="-14" y="8" width="28" height="10" rx="4" fill="#74B9FF" opacity="0.7"/>`;
  html += `<g>
    <rect x="-28" y="-30" width="10" height="16" rx="4" fill="#2D3436"/>
    <rect x="-26" y="-28" width="6" height="4" rx="1" fill="#636E72"/>
    <rect x="18" y="-30" width="10" height="16" rx="4" fill="#2D3436"/>
    <rect x="20" y="-28" width="6" height="4" rx="1" fill="#636E72"/>
    <rect x="-28" y="12" width="10" height="16" rx="4" fill="#2D3436"/>
    <rect x="-26" y="14" width="6" height="4" rx="1" fill="#636E72"/>
    <rect x="18" y="12" width="10" height="16" rx="4" fill="#2D3436"/>
    <rect x="20" y="14" width="6" height="4" rx="1" fill="#636E72"/>
  </g>`;
  html += `<ellipse cx="-14" cy="-38" rx="4" ry="3" fill="#FFEAA7" opacity="0.9"/>`;
  html += `<ellipse cx="14" cy="-38" rx="4" ry="3" fill="#FFEAA7" opacity="0.9"/>`;
  html += `<rect x="-20" y="22" width="8" height="4" rx="2" fill="#FF6B6B"/>`;
  html += `<rect x="12" y="22" width="8" height="4" rx="2" fill="#FF6B6B"/>`;
  html += `</g>`;

  for (const e of carEffects) {
    const alpha = Math.min(1, e.t * 2);
    const color = e.type === "hit" ? "#00B894" : e.type === "wrong" ? "#636E72" : "#E17055";
    const size = e.type === "hit" ? 24 : 20;
    html += `<text x="${e.x}" y="${e.y}" text-anchor="middle" fill="${color}" font-size="${size}" font-weight="800" opacity="${alpha.toFixed(2)}">${e.text}</text>`;
    if (e.type === "hit") {
      for (let si = 0; si < 3; si++) {
        const angle = (si / 3) * Math.PI * 2 + e.t * 5;
        const dist = (0.6 - e.t) * 30;
        const sx = e.x + Math.cos(angle) * dist;
        const sy = e.y + Math.sin(angle) * dist;
        html += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.5" fill="#FFEAA7" opacity="${(alpha * 0.8).toFixed(2)}"/>`;
      }
    }
  }

  for (let i = 0; i < state.carLives; i++) {
    const hx = 25 + i * 35;
    html += `<g transform="translate(${hx}, 25)">
      <path d="M0-6C-2-10-8-10-8-5S0 4 0 6C0 4 8-5 8-5S8-10 2-10Z" fill="#E17055" stroke="#C0392B" stroke-width="1"/>
    </g>`;
  }

  html += `<rect x="${CAR_W - 110}" y="8" width="100" height="30" rx="15" fill="rgba(0,0,0,0.3)"/>`;
  html += `<text x="${CAR_W - 60}" y="29" text-anchor="middle" fill="#FFEAA7" font-size="16" font-weight="700">⭐ ${state.carScore}</text>`;

  html += `</g>`;
  svg.innerHTML = html;
}

function finishCarGame() {
  stopCarGame();
  const accuracy = state.carTotal > 0 ? Math.round((state.carCorrect / state.carTotal) * 100) : 0;
  let stars = 1;
  if (state.carScore >= 100 && accuracy >= 70) stars = 2;
  if (state.carScore >= 200 && accuracy >= 85) stars = 3;

  dom.carResultStars.textContent = starStr(stars, 3);
  dom.carResultScore.textContent = state.carScore;
  dom.carResultAccuracy.textContent = accuracy + "%";

  const messages = [
    "Niezły początek kierowco! 🚗",
    "Świetna jazda! Coraz lepiej! 🏁",
    "MISTRZ KIEROWNICY! Perfekcyjnie! 🏆",
  ];
  dom.carResultTitle.textContent = stars === 3 ? "🏆 Mistrz!" : stars === 2 ? "🏁 Świetnie!" : "🚗 Nieźle!";
  dom.carResultMessage.textContent = messages[stars - 1];
  showModal("car-result");
}
