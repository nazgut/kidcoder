/* ==========================================================
   KidCoder – Diploma Module
   ========================================================== */

function renderDiploma() {
  if (!dom.diplomaContainer) return;
  const p = state.progress;
  const totalLevels = state.levels.length;
  const totalTyping = state.typingLessons.length;
  const completedLevels = (p.completed || []).length;
  const completedTyping = (p.typing_completed || []).length;
  const totalLogic = (state.logicPuzzles || []).length;
  const completedLogic = (p.logic_completed || []).length;
  const totalMemory = (state.memoryGames || []).length;
  const completedMemory = (p.memory_completed || []).length;
  const totalAdventure = (typeof ADV_LEVELS !== 'undefined') ? ADV_LEVELS.length : 0;
  const completedAdventure = (p.adventure_completed || []).length;
  const totalThinking = (state.thinkingExercises || []).length;
  const completedThinking = (p.thinking_completed || []).length;
  const totalCodingStars = Object.values(p.stars || {}).reduce((a, b) => a + b, 0);
  const totalTypingStars = Object.values(p.typing_stars || {}).reduce((a, b) => a + b, 0);
  const totalLogicStars = Object.values(p.logic_stars || {}).reduce((a, b) => a + b, 0);
  const totalMemoryStars = Object.values(p.memory_stars || {}).reduce((a, b) => a + b, 0);
  const totalAdventureStars = Object.values(p.adventure_stars || {}).reduce((a, b) => a + b, 0);
  const totalThinkingStars = Object.values(p.thinking_stars || {}).reduce((a, b) => a + b, 0);
  const allStars = totalCodingStars + totalTypingStars + totalLogicStars + totalMemoryStars + totalAdventureStars + totalThinkingStars;
  const maxStars = (totalLevels + totalTyping + totalLogic + totalMemory + totalAdventure + totalThinking) * 3;
  const bestWpm = Math.max(0, ...Object.values(p.typing_best_wpm || {}));

  const totalAll = totalLevels + totalTyping + totalLogic + totalMemory + totalAdventure + totalThinking;
  const completedAll = completedLevels + completedTyping + completedLogic + completedMemory + completedAdventure + completedThinking;
  const allDone = completedAll >= totalAll && totalAll > 0;

  if (!allDone) {
    dom.diplomaContainer.innerHTML = `
      <div class="diploma-lock-message">
        <h2>🎓 Dyplom</h2>
        <p>Ukończ wszystkie lekcje, żeby odblokować dyplom!</p>
        <p style="margin-top:20px">
          🧩 Kodowanie: <strong>${completedLevels} / ${totalLevels}</strong><br>
          ⌨️ Pisanie: <strong>${completedTyping} / ${totalTyping}</strong><br>
          🧠 Logika: <strong>${completedLogic} / ${totalLogic}</strong><br>
          🃏 Memory: <strong>${completedMemory} / ${totalMemory}</strong><br>
          🗺️ Przygoda: <strong>${completedAdventure} / ${totalAdventure}</strong><br>
          🤖 Myślenie: <strong>${completedThinking} / ${totalThinking}</strong>
        </p>
        <div style="margin-top:20px">
          <div style="background:#E8E4F8;border-radius:20px;height:20px;max-width:400px;margin:0 auto">
            <div style="background:linear-gradient(90deg,#6C5CE7,#A29BFE);height:100%;border-radius:20px;width:${totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0}%;transition:width 0.5s"></div>
          </div>
          <p style="margin-top:8px;color:#636E72">${totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0}% ukończono</p>
        </div>
      </div>
    `;
    return;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });

  dom.diplomaContainer.innerHTML = `
    <div class="diploma-preview" id="diploma-printable">
      <div style="font-size:3rem;margin-bottom:10px">🏆</div>
      <h1>Dyplom Ukończenia</h1>
      <h2>KidCoder – Nauka Programowania</h2>
      <p style="font-size:1rem;color:#636E72">Niniejszym zaświadcza się, że</p>
      <div class="diploma-name">${esc(state.username)}</div>
      <p style="font-size:1.05rem;color:#636E72">ukończył(a) z powodzeniem wszystkie lekcje programowania i pisania!</p>
      <div class="diploma-stats">
        <div class="diploma-stat">
          <div class="diploma-stat-value">⭐ ${allStars}/${maxStars}</div>
          <div class="diploma-stat-label">Gwiazdki</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">🧩 ${completedLevels}</div>
          <div class="diploma-stat-label">Poziomy kodowania</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">⌨️ ${completedTyping}</div>
          <div class="diploma-stat-label">Lekcje pisania</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">🧠 ${completedLogic}</div>
          <div class="diploma-stat-label">Zagadki logiczne</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">🃏 ${completedMemory}</div>
          <div class="diploma-stat-label">Gry memory</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">🗺️ ${completedAdventure}</div>
          <div class="diploma-stat-label">Przygoda</div>
        </div>
        <div class="diploma-stat">
          <div class="diploma-stat-value">🤖 ${completedThinking}</div>
          <div class="diploma-stat-label">Myślenie</div>
        </div>
        ${bestWpm ? `<div class="diploma-stat"><div class="diploma-stat-value">🚀 ${bestWpm}</div><div class="diploma-stat-label">Najlepsze WPM</div></div>` : ""}
      </div>
      <div class="diploma-date">${dateStr}</div>
    </div>
    <button class="btn btn-primary btn-lg btn-print" onclick="printDiploma()">🖨️ Drukuj dyplom</button>
  `;
}

function printDiploma() {
  const content = document.getElementById("diploma-printable");
  if (!content) return;
  const printDiv = document.createElement("div");
  printDiv.className = "diploma-print";
  printDiv.innerHTML = content.outerHTML;
  document.body.appendChild(printDiv);
  window.print();
  document.body.removeChild(printDiv);
}
