/* ==========================================================
   KidCoder – Fun module (dźwięki, konfetti, pochwały)
   Ładowany jako ostatni skrypt – opakowuje showModal itd.
   ========================================================== */

const Fun = (() => {
  let ctx = null;
  let muted = localStorage.getItem("kidcoder_muted") === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function audioCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = "sine", delay = 0, vol = 0.18, slide = 0 } = {}) {
    const ac = audioCtx();
    if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const SOUNDS = {
    click:   () => tone(620, 0.06, { type: "triangle", vol: 0.07 }),
    pop:     () => tone(880, 0.08, { type: "triangle", vol: 0.12, slide: 240 }),
    flip:    () => tone(500, 0.09, { type: "sine", vol: 0.1, slide: 220 }),
    correct: () => { tone(660, 0.1, { type: "triangle" }); tone(880, 0.14, { type: "triangle", delay: 0.09 }); },
    wrong:   () => tone(180, 0.2, { type: "sawtooth", vol: 0.1, slide: -60 }),
    star:    () => tone(1320, 0.16, { type: "sine", vol: 0.14 }),
    fanfare: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, { type: "triangle", delay: i * 0.11 }));
      tone(1047, 0.5, { type: "sine", delay: 0.45, vol: 0.1 });
      tone(1319, 0.5, { type: "sine", delay: 0.45, vol: 0.08 });
    },
    levelup: () => { for (let i = 0; i < 6; i++) tone(400 + i * 120, 0.09, { type: "square", delay: i * 0.06, vol: 0.06 }); },
  };

  function sound(name) {
    const fn = SOUNDS[name];
    if (fn) fn();
  }

  // ---------- Konfetti ----------
  const CONFETTI_COLORS = ["#FF6B81", "#FFD93D", "#6C5CE7", "#00CEC9", "#55EFC4", "#74B9FF", "#FDCB6E", "#FD79A8"];

  function confetti(count = 130) {
    if (reducedMotion) return;
    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const c = canvas.getContext("2d");
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      w: 6 + Math.random() * 7,
      h: 8 + Math.random() * 8,
      vy: 2.4 + Math.random() * 3.2,
      vx: -1.6 + Math.random() * 3.2,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
    }));
    const start = performance.now();
    (function frame(now) {
      const t = now - start;
      c.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.03;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      });
      if (t < 2600) requestAnimationFrame(frame);
      else canvas.remove();
    })(start);
  }

  // ---------- Wielka pochwała ----------
  const PRAISES = ["SUPER!", "BRAWO!", "EKSTRA!", "REWELACJA!", "MISTRZ!", "WOW!", "GENIALNIE!", "TAK JEST!"];

  function praiseBurst() {
    if (reducedMotion) return;
    const el = document.createElement("div");
    el.className = "praise-burst";
    el.textContent = PRAISES[(Math.random() * PRAISES.length) | 0];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  function celebrate() {
    confetti();
    praiseBurst();
    sound("fanfare");
  }

  // ---------- Wyciszenie ----------
  function toggleMute() {
    muted = !muted;
    localStorage.setItem("kidcoder_muted", muted ? "1" : "0");
    syncMuteBtn();
  }
  function syncMuteBtn() {
    const btn = document.getElementById("btn-sound");
    if (btn) btn.textContent = muted ? "🔇" : "🔊";
  }

  return { sound, confetti, celebrate, praiseBurst, toggleMute, syncMuteBtn, isMuted: () => muted };
})();

/* ---------- Globalne zaczepy ---------- */

// Sukces w modalu => konfetti + fanfary (tylko gdy są gwiazdki)
if (typeof showModal === "function") {
  const _showModal = showModal;
  showModal = function (name) {
    _showModal(name);
    const modal = document.getElementById(`modal-${name}`);
    if (!modal) return;
    if (/success|result|complete/.test(name)) {
      const stars = modal.querySelector(".modal-stars");
      if (!stars || stars.textContent.includes("⭐")) Fun.celebrate();
    }
  };
}

// Klik w dowolny przycisk => cichy klik
document.addEventListener("click", e => {
  if (e.target.closest("button")) Fun.sound("click");
}, true);

// Istniejące animacje CSS sterują dźwiękami we wszystkich grach
document.addEventListener("animationstart", e => {
  if (e.animationName === "shake") Fun.sound("wrong");
  else if (e.animationName === "correctBounce") Fun.sound("correct");
  else if (e.animationName === "memoryMatch") Fun.sound("pop");
});

document.addEventListener("DOMContentLoaded", () => {
  Fun.syncMuteBtn();
  const btn = document.getElementById("btn-sound");
  if (btn) btn.addEventListener("click", Fun.toggleMute);
});
