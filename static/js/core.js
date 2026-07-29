/* ==========================================================
   KidCoder – Core module (shared state, DOM, utilities)
   ========================================================== */

const API = "";  // same origin

// ============ STATE ============
const state = {
  username: "",
  progress: { completed: [], stars: {}, current_level: 1,
              typing_completed: [], typing_stars: {}, typing_best_wpm: {},
              logic_completed: [], logic_stars: {},
              quiz_completed: [], quiz_stars: {},
              memory_completed: [], memory_stars: {},
              crossword_completed: [], crossword_stars: {} },
  levels: [],
  typingLessons: [],
  currentLevel: null,
  currentTyping: null,
  program: [],
  executing: false,
  heroX: 0,
  heroY: 0,
  heroDir: "right",
  collectedGems: [],
  hintIndex: 0,
  stepIndex: 0,
  animTimer: null,
  // typing state
  typingText: "",
  typingPos: 0,
  typingCorrect: 0,
  typingErrors: 0,
  typingStarted: false,
  typingFinished: false,
  typingStartTime: null,
  typingTimerInterval: null,
  typingTimeLeft: 0,
  // car game state
  carActive: false,
  carScore: 0,
  carLives: 3,
  carCorrect: 0,
  carTotal: 0,
  carLetters: [],
  carAnimFrame: null,
  carLessonId: null,
  carChars: "",
  // logic state
  logicPuzzles: [],
  currentLogic: null,
  logicHintIndex: 0,
  logicAttempts: 0,
  logicSolved: false,
  // quiz state
  quizQuestions: [],
  currentQuiz: null,
  quizAttempts: 0,
  quizSolved: false,
  quizHintIndex: 0,
  // memory state
  memoryGames: [],
  currentMemory: null,
  memoryCards: [],
  memoryFlipped: [],
  memoryMatched: [],
  memoryMoves: 0,
  memoryLocked: false,
  memoryStartTime: null,
  memoryTimerInterval: null,
  memoryTimeLeft: 0,
  memoryFinished: false,
  // adventure state
  adventureWorld: null,
  adventureActive: false,
  adventurePlayerX: 0,
  adventurePlayerY: 0,
  adventureFrame: null,
  // crossword state
  crosswordPuzzles: [],
  currentCrossword: null,
  crosswordAttempts: 0,
  crosswordSolved: false,
  crosswordSolution: null,
  crosswordInputs: [],
  // sudoku state
  sudokuPuzzles: [],
  currentSudoku: null,
  sudokuAttempts: 0,
  sudokuSolved: false,
  sudokuInputs: [],
  sudokuHintIndex: 0,
  // math state
  mathProblems: [],
  currentMath: null,
  mathAttempts: 0,
  mathSolved: false,
  mathHintIndex: 0,
  // pixel state
  pixelPuzzles: [],
  currentPixel: null,
  pixelPlayerGrid: [],
  pixelSelectedColor: null,
  pixelMistakes: 0,
  pixelSolved: false,
  pixelHintIndex: 0,
  // cipher state
  cipherPuzzles: [],
  currentCipher: null,
  cipherSlots: [],
  cipherTiles: [],
  cipherAttempts: 0,
  cipherSolved: false,
  cipherHintIndex: 0,
  // binary state
  binaryPuzzles: [],
  currentBinary: null,
  binaryOn: [],
  binaryAttempts: 0,
  binarySolved: false,
  binaryHintIndex: 0,
  // melody state
  melodyGames: [],
  currentMelody: null,
  melodySequence: [],
  melodyInputPos: 0,
  melodyMistakes: 0,
  melodyPlaying: false,
  melodySolved: false,
  melodyHintIndex: 0,
  // debug state
  debugPuzzles: [],
  currentDebug: null,
  debugAttempts: 0,
  debugSolved: false,
  debugHintIndex: 0,
  // avatar
  avatar: "🙂",
};

const DIR_DELTAS = {
  right: [1, 0],
  down:  [0, 1],
  left:  [-1, 0],
  up:    [0, -1],
};
const DIR_ORDER = ["right", "down", "left", "up"];

// ============ BLOCK DEFINITIONS ============
const BLOCK_DEFS = {
  forward:        { label: "Do przodu",        icon: "arrow",     category: "action" },
  turn_right:     { label: "Skręt w prawo",    icon: "turn-r",    category: "action" },
  turn_left:      { label: "Skręt w lewo",     icon: "turn-l",    category: "action" },
  collect:        { label: "Zbierz",           icon: "gem",       category: "action" },
  repeat_3:       { label: "Powtórz ×3",       icon: "loop",      category: "control", container: true, repeat: 3 },
  repeat_5:       { label: "Powtórz ×5",       icon: "loop",      category: "control", container: true, repeat: 5 },
  if_wall:        { label: "Sprytny ruch",     icon: "question",  category: "control", container: false },
  if_path_clear:  { label: "Jeśli droga wolna", icon: "if-yes",   category: "condition", container: true, condition: "path_clear" },
  if_wall_ahead:  { label: "Jeśli ściana",     icon: "if-no",     category: "condition", container: true, condition: "wall_ahead" },
  define_func:    { label: "Zdefiniuj funkcję", icon: "func",     category: "function", container: true },
  call_func:      { label: "Wywołaj funkcję",  icon: "play",      category: "function" },
};

// ============ SVG BLOCK ICONS ============
function blockIconSVG(type) {
  const svgs = {
    arrow: `<svg viewBox="0 0 26 26"><path d="M4 13h14M13 7l6 6-6 6" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    "turn-r": `<svg viewBox="0 0 26 26"><path d="M6 18V10a4 4 0 0 1 4-4h6" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M14 3l4 3-4 3" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    "turn-l": `<svg viewBox="0 0 26 26"><path d="M20 18V10a4 4 0 0 0-4-4H10" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M12 3L8 6l4 3" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    gem: `<svg viewBox="0 0 26 26"><polygon points="13,3 23,10 13,23 3,10" fill="#55EFC4" stroke="#FFF" stroke-width="1.5"/><line x1="3" y1="10" x2="23" y2="10" stroke="#FFF" stroke-width="1.5"/><line x1="13" y1="3" x2="10" y2="10" stroke="#FFF" stroke-width="1"/><line x1="13" y1="3" x2="16" y2="10" stroke="#FFF" stroke-width="1"/><line x1="10" y1="10" x2="13" y2="23" stroke="#FFF" stroke-width="1"/><line x1="16" y1="10" x2="13" y2="23" stroke="#FFF" stroke-width="1"/></svg>`,
    loop: `<svg viewBox="0 0 26 26"><path d="M18 8a6 6 0 1 1-8 0" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M12 4l-3 4 4 2" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    question: `<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="none" stroke="#FFF" stroke-width="2"/><text x="13" y="18" text-anchor="middle" fill="#FFF" font-size="14" font-weight="800">?</text></svg>`,
    "if-yes": `<svg viewBox="0 0 26 26"><path d="M13 2L24 13 13 24 2 13Z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M8 13l3 3 6-6" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    "if-no": `<svg viewBox="0 0 26 26"><path d="M13 2L24 13 13 24 2 13Z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M9 9l8 8M17 9l-8 8" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
    func: `<svg viewBox="0 0 26 26"><rect x="3" y="5" width="20" height="16" rx="3" fill="none" stroke="#FFF" stroke-width="2"/><text x="13" y="17" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">fn</text></svg>`,
    play: `<svg viewBox="0 0 26 26"><polygon points="8,4 22,13 8,22" fill="#FFF"/></svg>`,
  };
  return svgs[type] || svgs.arrow;
}

// ============ DOM REFS ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {};

function initDom() {
  dom.loginScreen   = $("#screen-login");
  dom.levelsScreen  = $("#screen-levels");
  dom.gameScreen    = $("#screen-game");
  dom.usernameInput = $("#username-input");
  dom.btnStart      = $("#btn-start");
  dom.userDisplay   = $("#user-display");
  dom.totalStars    = $("#total-stars");
  dom.levelsGrid    = $("#levels-grid");
  dom.levelTitle    = $("#level-title");
  dom.levelDesc     = $("#level-description");
  dom.toolbox       = $("#toolbox");
  dom.programArea   = $("#program-area");
  dom.gameSvg       = $("#game-svg");
  dom.gameMessage   = $("#game-message");
  dom.btnRun        = $("#btn-run");
  dom.btnStep       = $("#btn-step");
  dom.btnClear      = $("#btn-clear");
  dom.btnBack       = $("#btn-back");
  dom.btnReset      = $("#btn-reset");
  dom.btnHint       = $("#btn-hint");
  dom.modalSuccess  = $("#modal-success");
  dom.modalStars    = $("#modal-stars");
  dom.modalMessage  = $("#modal-message");
  dom.btnNextLevel  = $("#btn-next-level");
  dom.btnReplay     = $("#btn-replay");
  dom.btnToLevels   = $("#btn-to-levels");
  dom.modalHint     = $("#modal-hint");
  dom.hintText      = $("#hint-text");
  dom.btnCloseHint  = $("#btn-close-hint");

  // Typing DOM refs
  dom.btnBackTyping    = $("#btn-back-typing");
  dom.typingTitle      = $("#typing-title");
  dom.typingTimer      = $("#typing-timer");
  dom.typingWpm        = $("#typing-wpm");
  dom.typingDesc       = $("#typing-desc");
  dom.typingDisplay    = $("#typing-display");
  dom.typingDone       = $("#typing-done");
  dom.typingCurrent    = $("#typing-current");
  dom.typingRemaining  = $("#typing-remaining");
  dom.typingInput      = $("#typing-input");
  dom.statAccuracy     = $("#stat-accuracy");
  dom.statSpeed        = $("#stat-speed");
  dom.statCorrect      = $("#stat-correct");
  dom.statErrors       = $("#stat-errors");
  dom.keyboardVisual   = $("#keyboard-visual");
  dom.btnTypingRestart = $("#btn-typing-restart");
  dom.modalTypingResult  = $("#modal-typing-result");
  dom.typingResultStars  = $("#typing-result-stars");
  dom.typingResultTitle  = $("#typing-result-title");
  dom.typingResultMessage = $("#typing-result-message");
  dom.resultWpm        = $("#result-wpm");
  dom.resultAccuracy   = $("#result-accuracy");
  dom.btnTypingNext    = $("#btn-typing-next");
  dom.btnTypingRetry   = $("#btn-typing-retry");
  dom.btnTypingToList  = $("#btn-typing-to-list");
  dom.typingGrid       = $("#typing-grid");
  dom.tabBtns          = $$(".tab-btn");

  // Car game DOM refs
  dom.btnBackCar       = $("#btn-back-car");
  dom.carTitle         = $("#car-title");
  dom.carScore         = $("#car-score");
  dom.carLives         = $("#car-lives");
  dom.carSvg           = $("#car-svg");
  dom.carMessage       = $("#car-message");
  dom.modalCarResult   = $("#modal-car-result");
  dom.carResultStars   = $("#car-result-stars");
  dom.carResultTitle   = $("#car-result-title");
  dom.carResultMessage = $("#car-result-message");
  dom.carResultScore   = $("#car-result-score");
  dom.carResultAccuracy = $("#car-result-accuracy");
  dom.btnCarRetry      = $("#btn-car-retry");
  dom.btnCarToList     = $("#btn-car-to-list");

  // Logic game DOM refs
  dom.logicGrid        = $("#logic-grid");
  dom.btnBackLogic     = $("#btn-back-logic");
  dom.logicTitle       = $("#logic-title");
  dom.logicDesc        = $("#logic-desc");
  dom.logicPuzzleArea  = $("#logic-puzzle-area");
  dom.logicOptions     = $("#logic-options");
  dom.logicFeedback    = $("#logic-feedback");
  dom.btnLogicHint     = $("#btn-logic-hint");
  dom.modalLogicSuccess  = $("#modal-logic-success");
  dom.logicModalStars    = $("#logic-modal-stars");
  dom.logicModalMessage  = $("#logic-modal-message");
  dom.logicExplanation   = $("#logic-explanation");
  dom.btnNextLogic       = $("#btn-next-logic");
  dom.btnLogicToList     = $("#btn-logic-to-list");

  // Quiz DOM refs
  dom.quizGrid         = $("#quiz-grid");
  dom.btnBackQuiz      = $("#btn-back-quiz");
  dom.quizTitle        = $("#quiz-title");
  dom.quizDesc         = $("#quiz-desc");
  dom.quizContent      = $("#quiz-content");
  dom.quizOptions      = $("#quiz-options");
  dom.quizFeedback     = $("#quiz-feedback");
  dom.quizCode         = $("#quiz-code");
  dom.btnQuizHint      = $("#btn-quiz-hint");
  dom.modalQuizSuccess = $("#modal-quiz-success");
  dom.quizModalStars   = $("#quiz-modal-stars");
  dom.quizModalMessage = $("#quiz-modal-message");
  dom.quizExplanation  = $("#quiz-explanation");
  dom.btnNextQuiz      = $("#btn-next-quiz");
  dom.btnQuizToList    = $("#btn-quiz-to-list");

  // Adventure DOM refs
  dom.adventureTitle   = $("#adventure-title");
  dom.btnBackAdventure = $("#btn-back-adventure");
  dom.adventureGrid    = $("#adventure-grid");
  dom.adventureGameArea    = $("#adventure-game-area");

  // Thinking DOM refs
  dom.thinkingGrid       = $("#thinking-grid");
  dom.btnBackThinking    = $("#btn-back-thinking");
  dom.thinkingTitle      = $("#thinking-title");
  dom.thinkingPuzzleArea = $("#thinking-puzzle-area");
  dom.thinkingOptions    = $("#thinking-options");
  dom.thinkingFeedback   = $("#thinking-feedback");
  dom.btnThinkingHint    = $("#btn-thinking-hint");
  dom.modalThinkingSuccess = $("#modal-thinking-success");
  dom.thinkingModalStars   = $("#thinking-modal-stars");
  dom.thinkingModalMessage = $("#thinking-modal-message");
  dom.thinkingExplanation  = $("#thinking-explanation");
  dom.btnNextThinking    = $("#btn-next-thinking");
  dom.btnThinkingToList  = $("#btn-thinking-to-list");

  // Memory DOM refs
  dom.memoryGrid       = $("#memory-grid");
  dom.btnBackMemory    = $("#btn-back-memory");
  dom.memoryTitle      = $("#memory-title");
  dom.memoryTimer      = $("#memory-timer");
  dom.memoryMoves      = $("#memory-moves");
  dom.memoryBoard      = $("#memory-board");
  dom.btnMemoryRestart = $("#btn-memory-restart");
  dom.modalMemoryResult  = $("#modal-memory-result");
  dom.memoryResultStars  = $("#memory-result-stars");
  dom.memoryResultTitle  = $("#memory-result-title");
  dom.memoryResultMessage = $("#memory-result-message");
  dom.memoryResultMoves  = $("#memory-result-moves");
  dom.memoryResultPairs  = $("#memory-result-pairs");
  dom.btnMemoryNext    = $("#btn-memory-next");
  dom.btnMemoryRetry   = $("#btn-memory-retry");
  dom.btnMemoryToList  = $("#btn-memory-to-list");

  // Crossword DOM refs
  dom.crosswordGrid         = $("#crossword-grid");
  dom.btnBackCrossword      = $("#btn-back-crossword");
  dom.crosswordTitle        = $("#crossword-title");
  dom.crosswordDesc         = $("#crossword-desc");
  dom.crosswordClues        = $("#crossword-clues");
  dom.crosswordBoard        = $("#crossword-board");
  dom.crosswordFeedback     = $("#crossword-feedback");
  dom.btnCrosswordCheck     = $("#btn-crossword-check");
  dom.modalCrosswordSuccess = $("#modal-crossword-success");
  dom.crosswordModalStars   = $("#crossword-modal-stars");
  dom.crosswordModalMessage = $("#crossword-modal-message");
  dom.btnNextCrossword      = $("#btn-next-crossword");
  dom.btnCrosswordToList    = $("#btn-crossword-to-list");

  // Sudoku DOM refs
  dom.sudokuGrid         = $("#sudoku-grid");
  dom.btnBackSudoku      = $("#btn-back-sudoku");
  dom.sudokuTitle        = $("#sudoku-title");
  dom.sudokuBoard        = $("#sudoku-board");
  dom.sudokuFeedback     = $("#sudoku-feedback");
  dom.btnSudokuCheck     = $("#btn-sudoku-check");
  dom.btnSudokuHint      = $("#btn-sudoku-hint");
  dom.modalSudokuSuccess = $("#modal-sudoku-success");
  dom.sudokuModalStars   = $("#sudoku-modal-stars");
  dom.sudokuModalMessage = $("#sudoku-modal-message");
  dom.btnNextSudoku      = $("#btn-next-sudoku");
  dom.btnSudokuToList    = $("#btn-sudoku-to-list");

  // Math DOM refs
  dom.mathGrid         = $("#math-grid");
  dom.btnBackMath      = $("#btn-back-math");
  dom.mathTitle        = $("#math-title");
  dom.mathDesc         = $("#math-desc");
  dom.mathVisual       = $("#math-visual");
  dom.mathProblemDisplay = $("#math-problem-display");
  dom.mathOptions      = $("#math-options");
  dom.mathFeedback     = $("#math-feedback");
  dom.btnMathHint      = $("#btn-math-hint");
  dom.modalMathSuccess = $("#modal-math-success");
  dom.mathModalStars   = $("#math-modal-stars");
  dom.mathModalMessage = $("#math-modal-message");
  dom.btnNextMath      = $("#btn-next-math");
  dom.btnMathToList    = $("#btn-math-to-list");

  // Pixel DOM refs
  dom.pixelGrid        = $("#pixel-grid");
  dom.btnBackPixel     = $("#btn-back-pixel");
  dom.pixelTitle       = $("#pixel-title");
  dom.pixelBoard       = $("#pixel-board");
  dom.pixelPalette     = $("#pixel-palette");
  dom.pixelFeedback    = $("#pixel-feedback");
  dom.btnPixelHint     = $("#btn-pixel-hint");
  dom.modalPixelSuccess = $("#modal-pixel-success");
  dom.pixelModalStars  = $("#pixel-modal-stars");
  dom.pixelModalMessage = $("#pixel-modal-message");
  dom.btnNextPixel     = $("#btn-next-pixel");
  dom.btnPixelToList   = $("#btn-pixel-to-list");

  // Cipher DOM refs
  dom.cipherGrid       = $("#cipher-grid");
  dom.btnBackCipher    = $("#btn-back-cipher");
  dom.cipherTitle      = $("#cipher-title");
  dom.cipherStory      = $("#cipher-story");
  dom.cipherKey        = $("#cipher-key");
  dom.cipherMessage    = $("#cipher-message");
  dom.cipherTiles      = $("#cipher-tiles");
  dom.cipherFeedback   = $("#cipher-feedback");
  dom.btnCipherHint    = $("#btn-cipher-hint");
  dom.modalCipherSuccess = $("#modal-cipher-success");
  dom.cipherModalStars = $("#cipher-modal-stars");
  dom.cipherModalMessage = $("#cipher-modal-message");
  dom.btnNextCipher    = $("#btn-next-cipher");
  dom.btnCipherToList  = $("#btn-cipher-to-list");

  // Binary DOM refs
  dom.binaryGrid       = $("#binary-grid");
  dom.btnBackBinary    = $("#btn-back-binary");
  dom.binaryTitle      = $("#binary-title");
  dom.binaryTarget     = $("#binary-target");
  dom.binaryBulbs      = $("#binary-bulbs");
  dom.binarySum        = $("#binary-sum");
  dom.binaryFeedback   = $("#binary-feedback");
  dom.btnBinaryHint    = $("#btn-binary-hint");
  dom.btnBinaryCheck   = $("#btn-binary-check");
  dom.modalBinarySuccess = $("#modal-binary-success");
  dom.binaryModalStars = $("#binary-modal-stars");
  dom.binaryModalMessage = $("#binary-modal-message");
  dom.btnNextBinary    = $("#btn-next-binary");
  dom.btnBinaryToList  = $("#btn-binary-to-list");

  // Melody DOM refs
  dom.melodyGrid       = $("#melody-grid");
  dom.btnBackMelody    = $("#btn-back-melody");
  dom.melodyTitle      = $("#melody-title");
  dom.melodyStatus     = $("#melody-status");
  dom.melodyPads       = $("#melody-pads");
  dom.melodyProgress   = $("#melody-progress");
  dom.melodyFeedback   = $("#melody-feedback");
  dom.btnMelodyPlay    = $("#btn-melody-play");
  dom.btnMelodyHint    = $("#btn-melody-hint");
  dom.modalMelodySuccess = $("#modal-melody-success");
  dom.melodyModalStars = $("#melody-modal-stars");
  dom.melodyModalMessage = $("#melody-modal-message");
  dom.btnNextMelody    = $("#btn-next-melody");
  dom.btnMelodyToList  = $("#btn-melody-to-list");

  // Debug DOM refs
  dom.debugGrid        = $("#debug-grid");
  dom.btnBackDebug     = $("#btn-back-debug");
  dom.debugTitle       = $("#debug-title");
  dom.debugStory       = $("#debug-story");
  dom.debugSteps       = $("#debug-steps");
  dom.debugFeedback    = $("#debug-feedback");
  dom.btnDebugHint     = $("#btn-debug-hint");
  dom.modalDebugSuccess = $("#modal-debug-success");
  dom.debugModalStars  = $("#debug-modal-stars");
  dom.debugModalMessage = $("#debug-modal-message");
  dom.debugExplanation = $("#debug-explanation");
  dom.btnNextDebug     = $("#btn-next-debug");
  dom.btnDebugToList   = $("#btn-debug-to-list");

  // Avatar & XP
  dom.avatarPicker     = $("#avatar-picker");
  dom.xpBadge          = $("#xp-badge");
  dom.xpFill           = $("#xp-fill");

  // Diploma & Logout
  dom.diplomaContainer = $("#diploma-container");
  dom.btnLogout        = $("#btn-logout");
}

// ============ NAVIGATION ============
function showScreen(name) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = $(`#screen-${name}`);
  if (el) el.classList.add("active");
}

// ============ MODALS ============
function showModal(name) {
  $(`#modal-${name}`).classList.add("visible");
}
function hideModal(name) {
  $(`#modal-${name}`).classList.remove("visible");
}

// ============ UTILITIES ============
function starStr(count, max) {
  return "⭐".repeat(count) + "☆".repeat(max - count);
}
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============ LOGIN & PROGRESS ============
async function onLogin() {
  const name = dom.usernameInput.value.trim();
  if (!name) { dom.usernameInput.focus(); return; }
  state.username = name;

  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(name)}`);
    state.progress = await res.json();
  } catch {
    state.progress = { completed: [], stars: {}, current_level: 1,
                       typing_completed: [], typing_stars: {}, typing_best_wpm: {},
                       logic_completed: [], logic_stars: {},
                       quiz_completed: [], quiz_stars: {},
                       memory_completed: [], memory_stars: {},
                       adventure_completed: [], adventure_stars: {},
                       thinking_completed: [], thinking_stars: {},
                       crossword_completed: [], crossword_stars: {},
                       sudoku_completed: [], sudoku_stars: {},
                       math_completed: [], math_stars: {} };
  }

  try {
    const [levRes, typRes, logRes, quizRes, memRes, thkRes, cwRes, sudRes, mathRes, pixRes, ciphRes, binRes, melRes, dbgRes] = await Promise.all([
      fetch(`${API}/api/levels`),
      fetch(`${API}/api/typing`),
      fetch(`${API}/api/logic`),
      fetch(`${API}/api/quiz`),
      fetch(`${API}/api/memory`),
      fetch(`${API}/api/thinking`),
      fetch(`${API}/api/crossword`),
      fetch(`${API}/api/sudoku`),
      fetch(`${API}/api/math`),
      fetch(`${API}/api/pixel`),
      fetch(`${API}/api/cipher`),
      fetch(`${API}/api/binary`),
      fetch(`${API}/api/melody`),
      fetch(`${API}/api/debug`),
    ]);
    state.levels = await levRes.json();
    state.typingLessons = await typRes.json();
    state.logicPuzzles = await logRes.json();
    state.quizQuestions = await quizRes.json();
    state.memoryGames = await memRes.json();
    state.thinkingExercises = await thkRes.json();
    state.crosswordPuzzles = await cwRes.json();
    state.sudokuPuzzles = await sudRes.json();
    state.mathProblems = await mathRes.json();
    state.pixelPuzzles = await pixRes.json();
    state.cipherPuzzles = await ciphRes.json();
    state.binaryPuzzles = await binRes.json();
    state.melodyGames = await melRes.json();
    state.debugPuzzles = await dbgRes.json();
  } catch { state.levels = []; state.typingLessons = []; state.logicPuzzles = []; state.quizQuestions = []; state.memoryGames = []; state.thinkingExercises = []; state.crosswordPuzzles = []; state.sudokuPuzzles = []; state.mathProblems = []; state.pixelPuzzles = []; state.cipherPuzzles = []; state.binaryPuzzles = []; state.melodyGames = []; state.debugPuzzles = []; }

  // Zapamiętaj wybrany awatar dla tego imienia
  const savedAvatar = localStorage.getItem(`kidcoder_avatar_${name}`);
  if (savedAvatar && !state.avatarTouched) state.avatar = savedAvatar;
  localStorage.setItem(`kidcoder_avatar_${name}`, state.avatar);

  dom.userDisplay.textContent = state.avatar + " " + name;
  updateStarDisplay();
  renderLevels();
  renderTypingLessons();
  renderLogicPuzzles();
  renderQuizList();
  renderMemoryList();
  renderAdventureMap();
  renderThinkingList();
  renderCrosswordList();
  renderSudokuList();
  renderMathList();
  renderPixelList();
  renderCipherList();
  renderBinaryList();
  renderMelodyList();
  renderDebugList();
  renderDiploma();
  showScreen("levels");
}

function updateStarDisplay() {
  const codingStars = Object.values(state.progress.stars || {}).reduce((a, b) => a + b, 0);
  const typingStars = Object.values(state.progress.typing_stars || {}).reduce((a, b) => a + b, 0);
  const logicStars = Object.values(state.progress.logic_stars || {}).reduce((a, b) => a + b, 0);
  const memoryStars = Object.values(state.progress.memory_stars || {}).reduce((a, b) => a + b, 0);
  const adventureStars = Object.values(state.progress.adventure_stars || {}).reduce((a, b) => a + b, 0);
  const thinkingStars = Object.values(state.progress.thinking_stars || {}).reduce((a, b) => a + b, 0);
  const crosswordStars = Object.values(state.progress.crossword_stars || {}).reduce((a, b) => a + b, 0);
  const sudokuStars = Object.values(state.progress.sudoku_stars || {}).reduce((a, b) => a + b, 0);
  const mathStars = Object.values(state.progress.math_stars || {}).reduce((a, b) => a + b, 0);
  const pixelStars = Object.values(state.progress.pixel_stars || {}).reduce((a, b) => a + b, 0);
  const cipherStars = Object.values(state.progress.cipher_stars || {}).reduce((a, b) => a + b, 0);
  const binaryStars = Object.values(state.progress.binary_stars || {}).reduce((a, b) => a + b, 0);
  const melodyStars = Object.values(state.progress.melody_stars || {}).reduce((a, b) => a + b, 0);
  const debugStars = Object.values(state.progress.debug_stars || {}).reduce((a, b) => a + b, 0);
  const total = codingStars + typingStars + logicStars + memoryStars + adventureStars + thinkingStars + crosswordStars + sudokuStars + mathStars + pixelStars + cipherStars + binaryStars + melodyStars + debugStars;
  dom.totalStars.textContent = "⭐ " + total;
  updateXpBadge(total);
}

// ============ POZIOM GRACZA (XP) ============
const XP_PER_LEVEL = 15;

function updateXpBadge(totalStars) {
  if (!dom.xpBadge) return;
  const level = Math.floor(totalStars / XP_PER_LEVEL) + 1;
  const into = totalStars % XP_PER_LEVEL;
  const prevLevel = state.playerLevel;   // undefined przy pierwszym wywołaniu po zalogowaniu
  state.playerLevel = level;

  dom.xpBadge.querySelector(".xp-level").textContent = `Poz. ${level}`;
  if (dom.xpFill) dom.xpFill.style.width = `${Math.round((into / XP_PER_LEVEL) * 100)}%`;

  if (prevLevel !== undefined && level > prevLevel && typeof Fun !== "undefined") {
    Fun.sound("levelup");
    Fun.confetti(60);
    dom.xpBadge.classList.add("level-up");
    setTimeout(() => dom.xpBadge.classList.remove("level-up"), 1200);
  }
}

async function saveProgress(levelId, stars) {
  try {
    const res = await fetch(`${API}/api/progress/${encodeURIComponent(state.username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level_id: levelId, stars }),
    });
    state.progress = await res.json();
    updateStarDisplay();
  } catch (e) { console.error("Save failed", e); }
}

// ============ EVENTS ============
function initEvents() {
  dom.btnStart.addEventListener("click", onLogin);
  dom.usernameInput.addEventListener("keydown", e => { if (e.key === "Enter") onLogin(); });
  dom.btnBack.addEventListener("click", () => { stopExecution(); showScreen("levels"); renderLevels(); });
  dom.btnRun.addEventListener("click", onRun);
  dom.btnStep.addEventListener("click", onStep);
  dom.btnClear.addEventListener("click", onClear);
  dom.btnReset.addEventListener("click", onResetLevel);
  dom.btnHint.addEventListener("click", onHint);
  dom.btnNextLevel.addEventListener("click", onNextLevel);
  dom.btnReplay.addEventListener("click", () => { hideModal("success"); onResetLevel(); });
  dom.btnToLevels.addEventListener("click", () => { hideModal("success"); showScreen("levels"); renderLevels(); });
  dom.btnCloseHint.addEventListener("click", () => hideModal("hint"));

  // Tab switching
  dom.tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dom.tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".tab-content").forEach(tc => tc.classList.remove("active"));
      $(`#tab-${btn.dataset.tab}`).classList.add("active");
    });
  });

  // Typing events
  dom.btnBackTyping.addEventListener("click", () => { stopTyping(); showScreen("levels"); renderLevels(); });
  dom.btnTypingRestart.addEventListener("click", () => { resetTyping(); });
  dom.typingInput.addEventListener("input", onTypingInput);
  dom.btnTypingNext.addEventListener("click", onNextTypingLesson);
  dom.btnTypingRetry.addEventListener("click", () => { hideModal("typing-result"); resetTyping(); });
  dom.btnTypingToList.addEventListener("click", () => { hideModal("typing-result"); showScreen("levels"); renderLevels(); });

  // Car game events
  dom.btnBackCar.addEventListener("click", () => { stopCarGame(); showScreen("levels"); renderLevels(); renderTypingLessons(); });
  dom.btnCarRetry.addEventListener("click", () => { hideModal("car-result"); startCarGame(state.carLessonId, state.carChars); });
  dom.btnCarToList.addEventListener("click", () => { hideModal("car-result"); showScreen("levels"); renderLevels(); renderTypingLessons(); });
  document.addEventListener("keydown", onCarKeyDown);

  // Logic game events
  dom.btnBackLogic.addEventListener("click", () => { showScreen("levels"); renderLogicPuzzles(); });
  dom.btnLogicHint.addEventListener("click", onLogicHint);
  dom.btnNextLogic.addEventListener("click", onNextLogic);
  dom.btnLogicToList.addEventListener("click", () => { hideModal("logic-success"); showScreen("levels"); renderLogicPuzzles(); });

  // Quiz events
  if (dom.btnBackQuiz) dom.btnBackQuiz.addEventListener("click", () => { showScreen("levels"); renderQuizList(); });
  if (dom.btnQuizHint) dom.btnQuizHint.addEventListener("click", onQuizHint);
  if (dom.btnNextQuiz) dom.btnNextQuiz.addEventListener("click", onNextQuiz);
  if (dom.btnQuizToList) dom.btnQuizToList.addEventListener("click", () => { hideModal("quiz-success"); showScreen("levels"); renderQuizList(); });

  // Memory events
  if (dom.btnBackMemory) dom.btnBackMemory.addEventListener("click", () => { stopMemoryGame(); showScreen("levels"); renderMemoryList(); });
  if (dom.btnMemoryRestart) dom.btnMemoryRestart.addEventListener("click", resetMemoryGame);
  if (dom.btnMemoryNext) dom.btnMemoryNext.addEventListener("click", onNextMemory);
  if (dom.btnMemoryRetry) dom.btnMemoryRetry.addEventListener("click", () => { hideModal("memory-result"); resetMemoryGame(); });
  if (dom.btnMemoryToList) dom.btnMemoryToList.addEventListener("click", () => { hideModal("memory-result"); showScreen("levels"); renderMemoryList(); });

  // Adventure events
  if (dom.btnBackAdventure) dom.btnBackAdventure.addEventListener("click", onAdventureBack);

  // Thinking events
  if (dom.btnBackThinking) dom.btnBackThinking.addEventListener("click", () => { showScreen("levels"); renderThinkingList(); });
  if (dom.btnThinkingHint) dom.btnThinkingHint.addEventListener("click", onThinkingHint);
  if (dom.btnNextThinking) dom.btnNextThinking.addEventListener("click", onNextThinking);
  if (dom.btnThinkingToList) dom.btnThinkingToList.addEventListener("click", () => { hideModal("thinking-success"); showScreen("levels"); renderThinkingList(); });

  // Crossword events
  if (dom.btnBackCrossword) dom.btnBackCrossword.addEventListener("click", () => { showScreen("levels"); renderCrosswordList(); });
  if (dom.btnCrosswordCheck) dom.btnCrosswordCheck.addEventListener("click", checkCrossword);
  if (dom.btnNextCrossword) dom.btnNextCrossword.addEventListener("click", onNextCrossword);
  if (dom.btnCrosswordToList) dom.btnCrosswordToList.addEventListener("click", () => { hideModal("crossword-success"); showScreen("levels"); renderCrosswordList(); });

  // Sudoku events
  if (dom.btnBackSudoku) dom.btnBackSudoku.addEventListener("click", () => { showScreen("levels"); renderSudokuList(); });
  if (dom.btnSudokuCheck) dom.btnSudokuCheck.addEventListener("click", checkSudoku);
  if (dom.btnSudokuHint) dom.btnSudokuHint.addEventListener("click", onSudokuHint);
  if (dom.btnNextSudoku) dom.btnNextSudoku.addEventListener("click", onNextSudoku);
  if (dom.btnSudokuToList) dom.btnSudokuToList.addEventListener("click", () => { hideModal("sudoku-success"); showScreen("levels"); renderSudokuList(); });

  // Math events
  if (dom.btnBackMath) dom.btnBackMath.addEventListener("click", () => { showScreen("levels"); renderMathList(); });
  if (dom.btnMathHint) dom.btnMathHint.addEventListener("click", onMathHint);
  if (dom.btnNextMath) dom.btnNextMath.addEventListener("click", onNextMath);
  if (dom.btnMathToList) dom.btnMathToList.addEventListener("click", () => { hideModal("math-success"); showScreen("levels"); renderMathList(); });

  // Pixel events
  if (dom.btnBackPixel) dom.btnBackPixel.addEventListener("click", () => { showScreen("levels"); renderPixelList(); });
  if (dom.btnPixelHint) dom.btnPixelHint.addEventListener("click", onPixelHint);
  if (dom.btnNextPixel) dom.btnNextPixel.addEventListener("click", onNextPixel);
  if (dom.btnPixelToList) dom.btnPixelToList.addEventListener("click", () => { hideModal("pixel-success"); showScreen("levels"); renderPixelList(); });

  // Cipher events
  if (dom.btnBackCipher) dom.btnBackCipher.addEventListener("click", () => { showScreen("levels"); renderCipherList(); });
  if (dom.btnCipherHint) dom.btnCipherHint.addEventListener("click", onCipherHint);
  if (dom.btnNextCipher) dom.btnNextCipher.addEventListener("click", onNextCipher);
  if (dom.btnCipherToList) dom.btnCipherToList.addEventListener("click", () => { hideModal("cipher-success"); showScreen("levels"); renderCipherList(); });

  // Binary events
  if (dom.btnBackBinary) dom.btnBackBinary.addEventListener("click", () => { showScreen("levels"); renderBinaryList(); });
  if (dom.btnBinaryHint) dom.btnBinaryHint.addEventListener("click", onBinaryHint);
  if (dom.btnBinaryCheck) dom.btnBinaryCheck.addEventListener("click", checkBinary);
  if (dom.btnNextBinary) dom.btnNextBinary.addEventListener("click", onNextBinary);
  if (dom.btnBinaryToList) dom.btnBinaryToList.addEventListener("click", () => { hideModal("binary-success"); showScreen("levels"); renderBinaryList(); });

  // Melody events
  if (dom.btnBackMelody) dom.btnBackMelody.addEventListener("click", () => { showScreen("levels"); renderMelodyList(); });
  if (dom.btnMelodyPlay) dom.btnMelodyPlay.addEventListener("click", playMelodySequence);
  if (dom.btnMelodyHint) dom.btnMelodyHint.addEventListener("click", onMelodyHint);
  if (dom.btnNextMelody) dom.btnNextMelody.addEventListener("click", onNextMelody);
  if (dom.btnMelodyToList) dom.btnMelodyToList.addEventListener("click", () => { hideModal("melody-success"); showScreen("levels"); renderMelodyList(); });

  // Debug events
  if (dom.btnBackDebug) dom.btnBackDebug.addEventListener("click", () => { showScreen("levels"); renderDebugList(); });
  if (dom.btnDebugHint) dom.btnDebugHint.addEventListener("click", onDebugHint);
  if (dom.btnNextDebug) dom.btnNextDebug.addEventListener("click", onNextDebug);
  if (dom.btnDebugToList) dom.btnDebugToList.addEventListener("click", () => { hideModal("debug-success"); showScreen("levels"); renderDebugList(); });

  // Avatar picker
  if (dom.avatarPicker) {
    dom.avatarPicker.querySelectorAll(".avatar-option").forEach(btn => {
      btn.addEventListener("click", () => {
        state.avatar = btn.dataset.avatar;
        state.avatarTouched = true;
        dom.avatarPicker.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
  }

  // Logout
  dom.btnLogout.addEventListener("click", onLogout);

  // Program area drag-and-drop
  dom.programArea.addEventListener("dragover", e => { e.preventDefault(); dom.programArea.classList.add("drag-over"); });
  dom.programArea.addEventListener("dragleave", () => dom.programArea.classList.remove("drag-over"));
  dom.programArea.addEventListener("drop", onDropProgram);
}

// ============ LOGOUT ============
function onLogout() {
  stopExecution();
  stopTyping();
  stopCarGame();
  if (typeof stopMemoryGame === "function") stopMemoryGame();
  if (typeof stopAdventure === "function") stopAdventure();

  state.username = "";
  state.progress = { completed: [], stars: {}, current_level: 1,
                     typing_completed: [], typing_stars: {}, typing_best_wpm: {},
                     logic_completed: [], logic_stars: {},
                     quiz_completed: [], quiz_stars: {},
                     memory_completed: [], memory_stars: {},
                     adventure_completed: [], adventure_stars: {},
                     thinking_completed: [], thinking_stars: {},
                     crossword_completed: [], crossword_stars: {},
                     sudoku_completed: [], sudoku_stars: {},
                     math_completed: [], math_stars: {},
                     pixel_completed: [], pixel_stars: {},
                     cipher_completed: [], cipher_stars: {},
                     binary_completed: [], binary_stars: {},
                     melody_completed: [], melody_stars: {},
                     debug_completed: [], debug_stars: {} };
  state.levels = [];
  state.typingLessons = [];
  state.logicPuzzles = [];
  state.quizQuestions = [];
  state.memoryGames = [];
  state.thinkingExercises = [];
  state.crosswordPuzzles = [];
  state.sudokuPuzzles = [];
  state.mathProblems = [];
  state.currentLevel = null;
  state.currentTyping = null;
  state.currentLogic = null;
  state.currentQuiz = null;
  state.currentMemory = null;
  state.currentThinking = null;
  state.currentCrossword = null;
  state.currentSudoku = null;
  state.currentMath = null;
  state.pixelPuzzles = [];
  state.currentPixel = null;
  state.cipherPuzzles = [];
  state.currentCipher = null;
  state.binaryPuzzles = [];
  state.currentBinary = null;
  state.melodyGames = [];
  state.currentMelody = null;
  state.debugPuzzles = [];
  state.currentDebug = null;
  state.playerLevel = undefined;
  state.avatarTouched = false;
  state.program = [];

  dom.usernameInput.value = "";
  dom.userDisplay.textContent = "👤 Gracz";
  dom.totalStars.textContent = "⭐ 0";
  if (dom.xpBadge) dom.xpBadge.querySelector(".xp-level").textContent = "Poz. 1";
  if (dom.xpFill) dom.xpFill.style.width = "0%";

  dom.tabBtns.forEach(b => b.classList.remove("active"));
  dom.tabBtns[0]?.classList.add("active");
  $$(".tab-content").forEach(tc => tc.classList.remove("active"));
  $("#tab-coding")?.classList.add("active");

  showScreen("login");
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  initDom();
  initEvents();
  showScreen("login");
});
